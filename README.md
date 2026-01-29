# 🎌 日语ASMR学习 | Japanese ASMR Learner

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

<p align="center">
  <b>通过轻柔的ASMR音频，沉浸式学习日语</b>
</p>

---

## ✨ 功能特色

### 🎧 听力练习
- 导入音频文件（MP3/WAV）和字幕文件（SRT/VTT）
- 逐句播放，支持变速（0.5x - 1.5x）
- **跟读模式**：自动暂停等待你跟读
- **单句循环**：反复练习难句
- 点击句子或进度条快速跳转

### 📚 生词本
- 选中文字一键添加生词
- 自动记录复习次数和掌握程度
- 支持手动添加和编辑
- 声调（Pitch Accent）可视化显示

### 🎴 闪卡复习
- 基于间隔重复的记忆系统
- 自动识别待复习单词
- 卡片翻转动画效果

### 🔤 假名学习
- 平假名/片假名对照表
- 多种测验模式：假名→罗马字、罗马字→假名
- 实时正确率统计

### 📖 语法库
- N5/N4 基础语法点整理
- 例句展示与笔记功能
- 支持自定义添加语法

### 🤖 AI 学习助手
- 集成 DeepSeek API
- 智能解释单词、语法
- **一键保存**：AI回答可直接存入生词本/语法库
- 聊天记录自动保存

### 📊 学习统计
- 连续学习天数追踪
- 每日目标设定与进度显示
- 学习时长、单词量统计

---

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 pnpm

### 安装

```bash
# 克隆项目
git clone https://github.com/YOUR_USERNAME/japanese-asmr-learner.git
cd japanese-asmr-learner

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:5173` 开始使用！

### 构建生产版本

```bash
npm run build
npm run preview  # 预览生产版本
```

---

## 📖 使用指南

### 1. 准备音频素材

准备好你想学习的日语音频文件（ASMR、动漫、日剧等均可），以及对应的字幕文件。

**支持的格式：**
- 音频：MP3, WAV, OGG, M4A
- 字幕：SRT, VTT

### 2. 导入素材

1. 点击「开始学习」进入听力页面
2. 点击「导入音频」选择音频文件
3. 点击「导入字幕」选择字幕文件
4. 开始播放！

### 3. 学习单词

- **选中查词**：在句子中选中任意日文，自动弹出词典
- **双击查词**：双击单词快速查询
- **添加生词**：点击「添加到生词本」保存

### 4. 配置 AI 助手

1. 点击 AI 助手设置按钮（⚙️）
2. 输入你的 [DeepSeek API Key](https://platform.deepseek.com)
3. 开始与 AI 对话学习！

---

## 🛠️ 技术栈

- **框架**：React 19 + TypeScript
- **构建**：Vite 7
- **样式**：CSS Variables + Glassmorphism
- **状态**：React Hooks + LocalStorage
- **AI**：DeepSeek API

---

## 📁 项目结构

```
japanese-asmr-learner/
├── src/
│   ├── components/       # React 组件
│   │   ├── AudioPlayer/  # 音频播放器
│   │   ├── SentencePanel/# 句子面板
│   │   ├── VocabularyBook/# 生词本
│   │   ├── FlashcardReview/# 闪卡复习
│   │   ├── KanaLearning/ # 假名学习
│   │   ├── GrammarLibrary/# 语法库
│   │   ├── AIChat/       # AI 聊天
│   │   └── ...
│   ├── hooks/            # 自定义 Hooks
│   ├── services/         # API 服务
│   ├── data/             # 静态数据
│   ├── types/            # TypeScript 类型
│   └── utils/            # 工具函数
├── public/               # 静态资源
└── package.json
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

---

## 🌟 致谢

- 设计灵感来自现代深色主题应用
- AI 能力由 [DeepSeek](https://deepseek.com) 提供

---

<p align="center">
  Made with ❤️ for Japanese learners
</p>
