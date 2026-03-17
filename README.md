> [!IMPORTANT]
> **Disclaimer**: This project is 100% AI Generated. **IOS Version coming soon**

# TacticalRMM Mobile (TRMM-Android-App)

A powerful, high-fidelity mobile companion for [TacticalRMM](https://tacticalrmm.com/). This application allows MSPs and IT professionals to monitor and manage their endpoints directly from their Android devices with a stunning, modern interface.

![TacticalRMM Mobile](https://via.placeholder.com/800x400?text=TacticalRMM+Mobile+Dashboard)

## 🚀 Key Features

- **🌐 Comprehensive Monitoring**: Track the real-time status (Online, Offline, Overdue) of all your managed endpoints.
- **🖥️ Remote Desktop**: Seamlessly connect to remote desktops using integrated MeshCentral support.
- **🐚 Remote Terminal**: Execute commands and manage systems via a secure, built-in shell.
- **📊 Health Overview**: Quick view of failing checks, warnings, and system health metrics at a glance.
- **📂 Client & Site Organization**: Intuitively navigate your infrastructure with agents grouped by Client and Site.
- **✨ Clean Minimalist UI**: Experience a professional, high-density interface focused on clarity and ease of use.

## 🛠️ Technology Stack

- **Core**: [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **UI Framework**: [Quasar Framework](https://quasar.dev/)
- **Native Bridge**: [Capacitor](https://capacitorjs.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/)
- [Android Studio](https://developer.android.com/studio) (for Android builds)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/brejzek/TRMM-Android-App.git
   cd TRMM-Android-App
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run in development mode**:
   ```bash
   npm run dev
   ```

### Android Deployment

1. **Build the web project**:
   ```bash
   npm run build
   ```

2. **Sync with Capacitor**:
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

## 🔐 Security

This app uses your TacticalRMM API Key for authentication. Ensure your API Keys are kept secure and have the appropriate permissions for the operations you intend to perform.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any bugs or feature requests.

---
