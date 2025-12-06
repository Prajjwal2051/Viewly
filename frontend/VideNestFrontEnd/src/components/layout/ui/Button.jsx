const Button = ({
    children,
    variant = 'default',
    size = 'default',
    className = '',
    ...props
}) => {
    const baseStyles = 'rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50';

    const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        ghost: 'hover:bg-gray-100 text-gray-700',
        outline: 'border border-gray-300 hover:bg-gray-50',
    };

    const sizes = {
        default: 'px-4 py-2',
        icon: 'p-2',
        sm: 'px-3 py-1.5 text-sm',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
