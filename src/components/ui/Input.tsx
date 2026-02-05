interface InputProps {
    readonly label: string;
    readonly type: "text" | "password" | "email";
    readonly placeholder: string;
    readonly required?: boolean;
    readonly value: string;
    readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({ 
  label, 
  type, 
  placeholder, 
  required = true, 
  value, 
  onChange 
}: InputProps) {
  // Use label as id and name (lowercase, replace spaces with hyphens)
  const id = label.toLowerCase().replaceAll(/\s+/g, '-');

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      />
    </div>
  );
}