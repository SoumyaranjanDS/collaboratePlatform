# <img src="client/public/logo.png" width="40" height="40" style="border-radius: 50%;"> Chatify Protocol

> **The next-generation collaborative workspace for technical teams.** 
> Execute logic, visualize algorithms, and sync your workflow in real-time.

[![Status](https://img.shields.io/badge/System-Online-3b82f6?style=flat-square)](#)
[![Version](https://img.shields.io/badge/Version-2.0.4-white?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](#)

---

## 🌌 Overview

**Chatify** is a high-performance MERN-stack application engineered for developers who need more than just a chat app. It combines real-time communication with a suite of technical tools—including shared compilers and data structure visualizers—all wrapped in a premium, minimalist HUD-style interface.

### [🚀 Launch Dashboard](https://chhatify.netlify.app/)

---

## ✨ Core Capabilities

### 💻 Live Compilation
Execute JavaScript, Python, and C++ in a shared environment. Collaborative coding with instant synchronization and shared terminal output.

### 📊 DSA Visualizer
Watch your data structures come to life. An interactive playground for visualizing algorithms, linked lists, trees, and graphs with real-time state manipulation.

### 💬 Logic Streams
Context-aware communication. Chatify integrates messaging directly into your files, allowing you to discuss logic exactly where it is written.

### 🔒 Secure Shards
Identity-based access control with end-to-end encryption. Create personal "shards" for sensitive snippets, private logic development, and protected documentation.

---

## 🛠️ Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Framer Motion, Lucide Icons |
| **Styling** | Vanilla CSS + Tailwind (HUD Components) |
| **Backend** | Node.js, Express |
| **Database** | MongoDB (Mongoose) |
| **Real-time** | Socket.io (Global Mesh) |
| **Visuals** | OGL (WebGL), Canvas API |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- NPM or Yarn

### 1. Clone the Mesh
```bash
git clone https://github.com/SoumyaranjanDS/collaboratePlatform.git
cd collaboratePlatform
```

### 2. Configure Environment
Create a `.env` file in the `/server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

### 3. Initialize Nodes
```bash
# Setup Server
cd server
npm install
npm run dev

# Setup Client
cd ../client
npm install
npm run dev
```

---

## 🔮 Future Features (Roadmap)

We are constantly refining the Chatify protocol. Here is what's coming next:

- [ ] **AI Logic Oracle**: Integrated LLM for real-time code suggestions and algorithm optimization within the compiler.
- [ ] **Expanded Runtime**: Support for Rust, Go, and Ruby execution environments.
- [ ] **Voice Shards**: Low-latency spatial audio rooms for seamless pair-programming sessions.
- [ ] **Git Mesh**: Native GitHub/GitLab integration to pull repositories directly into a shared workspace.
- [ ] **Mobile Interface**: A dedicated React Native application for monitoring logic streams on the go.
- [ ] **Custom Themes**: User-defined color palettes for the HUD and editor.

---

## 🛡️ Security Protocol

Chatify utilizes identity-based access control. All communication is synchronized through the **Global Mesh** (Socket.io), ensuring that only authorized nodes can access specific logic shards. Data is encrypted in transit using industry-standard TLS.

---

## 👨‍💻 Developed By

**SoumyaranjanDS**  
[soumya.site](https://soumya.site) | [LinkedIn](https://linkedin.com) | [GitHub](https://github.com/SoumyaranjanDS)

---

<p align="center">
  <img src="client/public/logo.png" width="100" height="100" style="border-radius: 50%; opacity: 0.2;">
  <br>
  <span style="opacity: 0.3; font-size: 10px; text-transform: uppercase; letter-spacing: 5px;">&copy; 2026 Chatify Laboratory</span>
</p>
