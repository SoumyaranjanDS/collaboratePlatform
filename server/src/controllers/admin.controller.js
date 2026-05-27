import User from "../models/User.js";
import Feedback from "../models/Feedback.js";
import Report from "../models/Report.js";
import { sendMail } from "../utils/mailer.js";

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      "username email role warnings createdAt isOnline",
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin users directory" });
  }
};

export const getAdminFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

export const getAdminReports = async (req, res) => {
  try {
    const reports = await Report.find({}).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports list" });
  }
};

export const warnUser = async (req, res) => {
  try {
    const { username, warningText } = req.body;
    if (!username || !warningText) {
      return res
        .status(400)
        .json({ error: "Username and warning text are required" });
    }
    const user = await User.findOneAndUpdate(
      { username },
      { $push: { warnings: warningText } },
      { new: true },
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Live push warning notification to user room
    const io = req.app.get("io");
    if (io) {
      io.to(username).emit("admin-warning", { warningText });
    }
    res.json({
      message: "Warning issued successfully",
      warnings: user.warnings,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to issue warning" });
  }
};

export const emailBlast = async (req, res) => {
  try {
    const { campaignType } = req.body;

    /* ────────────────────────────────────────────── */
    /* Validation */
    /* ────────────────────────────────────────────── */
    if (!campaignType) {
      return res.status(400).json({
        error: "Campaign type is required",
      });
    }

    /* ────────────────────────────────────────────── */
    /* Campaign Templates */
    /* ────────────────────────────────────────────── */
    const campaigns = {
      miss_you: {
        subject: "💙 We Miss You on Chatify",
        body: "Things just haven’t been the same without you around. Your friends are online, conversations are waiting, and Chatify misses your vibe.",
      },

      flirty_wifi: {
        subject: "📶 Feeling a Strong Connection",
        body: "Are you a Wi-Fi signal? Because the connection feels stronger whenever you’re online. Someone on Chatify is waiting to talk to you right now!",
      },

      flirty_magician: {
        subject: "✨ You Make Everyone Disappear",
        body: "Are you a magician? Because every time you appear online, the whole chat lights up.",
      },

      flirty_map: {
        subject: "🗺️ Lost In Your Messages",
        body: "Do you have a map? Because people keep getting lost looking for you in Chatify.",
      },

      flirty_google: {
        subject: "🔍 Everyone’s Searching For You",
        body: "Are you Google? Because you’re exactly what everyone’s been searching for.",
      },

      flirty_type: {
        subject: "⌨️ You’re Everyone’s Type",
        body: "Are you a keyboard? Because you’re exactly everyone’s type. Someone special might be waiting for your next message.",
      },

      flirty_coffee: {
        subject: "☕ Conversations Feel Better With You",
        body: "You must be coffee… because every conversation gets instantly better with you around.",
      },

      flirty_camera: {
        subject: "📸 You Make People Smile",
        body: "Are you a camera? Because every notification feels brighter when you’re around.",
      },

      flirty_puzzle: {
        subject: "🧩 You Complete The Community",
        body: "You’re the missing piece that makes the community complete.",
      },

      flirty_sun: {
        subject: "☀️ You Brighten Up Chatify",
        body: "You seriously brighten up the whole app when you’re online.",
      },

      flirty_song: {
        subject: "🎵 Impossible To Forget",
        body: "You’re like a favorite song — impossible to forget and always on someone’s mind.",
      },

      late_night: {
        subject: "🌙 Late Night Chats Hit Different",
        body: "Late night chats hit differently… Someone is online right now hoping you’ll message them first.",
      },

      trending_rooms: {
        subject: "🔥 Trending Rooms Are Live",
        body: "New trending rooms are blowing up right now! Don’t miss the conversations everyone’s talking about.",
      },

      unread_messages: {
        subject: "📩 You Have Unread Messages",
        body: "Someone took the time to reach out to you. Log back into Chatify and check your unread messages now!",
      },

      online_crush: {
        subject: "👀 Someone Is Online Right Now",
        body: "Someone you chatted with recently is online right now. Perfect timing to continue the conversation.",
      },

      streak_reminder: {
        subject: "⚡ Don’t Break Your Streak",
        body: "Your chat streak is about to break! Come back now and keep your conversations alive.",
      },

      friend_joined: {
        subject: "🎉 Your Friend Joined Chatify",
        body: "One of your friends just joined Chatify! Jump online and welcome them with your first message.",
      },

      weekend_vibes: {
        subject: "✨ Weekend Vibes Are Active",
        body: "Weekend vibes are active on Chatify right now — new people, fresh conversations, and good energy everywhere.",
      },

      voice_call_waiting: {
        subject: "📞 Someone Wants To Call You",
        body: "Someone is waiting to start a voice/video call with you. Don’t keep them waiting too long!",
      },

      comeback_reward: {
        subject: "🎁 Welcome Back Surprise",
        body: "A welcome-back surprise is waiting for you inside Chatify. Log back in and check it out!",
      },

      lonely_chat: {
        subject: "💭 A Conversation Can Change Everything",
        body: "A simple conversation can completely change your mood. Someone out there is waiting for your message.",
      },

      typing_moment: {
        subject: "⌨️ Someone Could Be Typing Right Now",
        body: "Imagine opening Chatify and seeing “someone is typing…” again. Your next conversation could start today.",
      },
    };

    /* ────────────────────────────────────────────── */
    /* Find Selected Campaign */
    /* ────────────────────────────────────────────── */
    const campaign = campaigns[campaignType];

    if (!campaign) {
      return res.status(400).json({
        error: "Invalid campaign type",
      });
    }

    /* ────────────────────────────────────────────── */
    /* Fetch Users */
    /* ────────────────────────────────────────────── */
    const users = await User.find({ role: { $ne: "admin" } }, "email username");

    if (!users.length) {
      return res.status(404).json({
        error: "No users found",
      });
    }

    /* ────────────────────────────────────────────── */
    /* Send Emails */
    /* ────────────────────────────────────────────── */
    await Promise.all(
      users.map(async (u) => {
        if (!u.email) return;

        try {
          await sendMail({
            to: u.email,
            subject: campaign.subject,

            html: `
              <div style="
                font-family: Arial, sans-serif;
                background: #0b1020;
                padding: 40px 20px;
                color: #ffffff;
              ">

                <div style="
                  max-width: 560px;
                  margin: auto;
                  background: linear-gradient(135deg, #111827, #1f2937);
                  border-radius: 20px;
                  overflow: hidden;
                  border: 1px solid rgba(255,255,255,0.08);
                  box-shadow: 0 10px 35px rgba(0,0,0,0.4);
                ">

                  <!-- Header -->
                  <div style="
                    padding: 35px 30px;
                    text-align: center;
                    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
                  ">
                    <h1 style="
                      margin: 0;
                      font-size: 28px;
                      font-weight: 800;
                      letter-spacing: 1px;
                    ">
                      Chatify
                    </h1>

                    <p style="
                      margin-top: 10px;
                      font-size: 13px;
                      opacity: 0.9;
                    ">
                      Reconnect • Chat • Video Call • Make Memories
                    </p>
                  </div>

                  <!-- Body -->
                  <div style="padding: 35px 30px;">

                    <p style="
                      font-size: 18px;
                      font-weight: bold;
                      margin-bottom: 18px;
                      color: #ffffff;
                    ">
                      Hey @${u.username} 👋
                    </p>

                    <p style="
                      font-size: 15px;
                      line-height: 1.8;
                      color: #d1d5db;
                      margin-bottom: 30px;
                    ">
                      ${campaign.body}
                    </p>

                    <div style="text-align: center;">
                      <a
                        href="https://chhatify.netlify.app/"
                        style="
                          display: inline-block;
                          background: linear-gradient(90deg, #6366f1, #8b5cf6);
                          color: #ffffff;
                          text-decoration: none;
                          padding: 14px 28px;
                          border-radius: 14px;
                          font-size: 13px;
                          font-weight: bold;
                          letter-spacing: 1px;
                          text-transform: uppercase;
                          box-shadow: 0 6px 20px rgba(99,102,241,0.4);
                        "
                      >
                        Open Chatify
                      </a>
                    </div>

                  </div>

                  <!-- Footer -->
                  <div style="
                    padding: 20px;
                    text-align: center;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    background: #0f172a;
                  ">
                    <p style="
                      font-size: 11px;
                      color: #94a3b8;
                      margin: 0;
                    ">
                      Sent with ❤️ by the Chatify Team
                    </p>
                  </div>

                </div>
              </div>
            `,
          });

          // console.log(`✅ Email sent to ${u.email}`);
        } catch (err) {
          console.error(`❌ Failed to send email to ${u.email}:`, err.message);
        }
      }),
    );

    /* ────────────────────────────────────────────── */
    /* Success Response */
    /* ────────────────────────────────────────────── */
    return res.status(200).json({
      success: true,
      message: `Campaign '${campaignType}' sent successfully to ${users.length} users.`,
    });
  } catch (err) {
    console.error("Email blast error:", err);

    return res.status(500).json({
      success: false,
      error: "Failed to run email blast campaign",
    });
  }
};
