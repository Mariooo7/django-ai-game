// frontend/src/components/Input.jsx
import React from 'react';

/**
 * Input Component
 * @description 一个通用的、已应用项目新设计系统的受控输入框组件。
 */
export default function Input({ label, type = 'text', name, value, onChange, placeholder, required = false }) {
  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-text-secondary mb-1"
      >
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label} // 如果没有 placeholder，则使用 label 作为提示
        required={required}
        // 应用在 tailwind.config.js 中定义的语义化颜色和效果
        // 提供更平滑的过渡效果和更清晰的聚焦状态
        className="block w-full px-4 py-3 bg-secondary border border-border rounded-lg shadow-sm placeholder-text-muted text-text-primary
                   transition duration-200 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
}