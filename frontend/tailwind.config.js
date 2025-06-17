// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";
import colors from 'tailwindcss/colors';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-yellow-400/20',
    'bg-gray-300/20',
    'bg-yellow-600/20',
    'bg-green-500/10',
    'bg-red-500/10',
  ],
  theme: {
    // 我们直接定义颜色，而不是在 extend 中，以便拥有一个全新的、干净的调色板
    colors: {
      // 基础色
      'white': '#FFFFFF',
      'black': '#000000',
      'transparent': 'transparent',
      // 语义化颜色系统
      'background': '#111827', // 非常深的近黑色，作为主背景，富有科技感
      'surface': {
        DEFAULT: '#1F2937',      // 卡片、面板的默认背景
      }, // 卡片和面板的背景色，比主背景稍亮，拉开层次
      'primary': {
        DEFAULT: '#06B6D4', // 明亮的“赛博青色”作为主色调
        // 副按钮的背景色，与主色调有对比
        secondary: '#63636d',
        hover: '#0891B2', // 主色调的悬停状态
        hoverSecondary: '#52525B', // 副按钮的悬停状态
      },
      'secondary': '#374151',  // 次要元素的背景色，如输入框
      'success': '#10B981',      // 成功状态的绿色
      'destructive': '#EF4444', // 错误、警示状态的红色
      // 文本颜色
      'text': {
        'primary': '#F9FAFB',     // 主要文本颜色，接近白色但更柔和
        'secondary': '#9CA3AF',  // 次要、辅助文本颜色
        'muted': '#6B7280',      // 更弱化的提示文字
        'lose': '#6B7280',    // 灰色表示失败状态
        'success': '#F59E0B', // 成功状态的橘色
        'draw': '#3B82F6',     // 平局状态的蓝色

      },
      // 边框颜色
      'border': '#4B5563',

      green: colors.green,
      red: colors.red,
      yellow: colors.yellow,
      gray: colors.gray,
      blue: colors.blue,
      purple: colors.purple,
    },
    fontFamily: {
      // 'sans' 是默认字体。这个字体栈优先使用系统UI字体，确保在所有平台都有最佳原生体验
      // 'Microsoft YaHei' 和 'PingFang SC' 分别是 Windows 和 macOS 上优秀的中文字体
      sans: ['Inter', ...defaultTheme.fontFamily.sans, '"Microsoft YaHei"', '"PingFang SC"'],
      // 'heading' 是我们的品牌/Logo专用字体
      heading: ['"Rubik Spray Paint"', 'cursive'],
    },
    extend: {
      // 在 extend 中添加我们希望保留或扩展的配置
      boxShadow: {
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'input-focus': '0 0 0 2px #06B6D4', // 聚焦时使用主色调的光晕效果
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
        'subtle-pulse': 'subtlePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ai-battle-smooth': 'aiBattleSmooth 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.85' },
        },
        // 定义文字渐变闪烁的关键帧
        aiBattleSmooth: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' }, // 50% 时透明度降低，产生闪烁效果
        },
      },
    },
  },
  plugins: [],
}

