// frontend/src/components/Input.jsx
import React from 'react';

// 这是一个“受控组件”，它的值完全由父组件通过 props 控制
// 这样做可以使表单状态的来源单一化，便于管理和校验
export default function Input({ label, type = 'text', name, value, onChange, placeholder, required = false }) {
  // props 解构:
  // label: 输入框上方的标签文字
  // type: input 元素的类型, 默认为 'text'
  // name: input 元素的 name 属性, 用于表单提交和 state 更新
  // value: input 的当前值, 由父组件的 state 提供
  // onChange: 当输入框内容改变时, 调用父组件的 state 更新函数
  // placeholder: 输入框的占位提示文字
  // required: HTML5 的表单属性, 表示是否为必填项

  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={name} // htmlFor 和 id 对应，能改善可访问性 (点击 label 可以聚焦到 input)
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        // 根据设计稿，应用 Tailwind CSS 样式
        className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  );
}