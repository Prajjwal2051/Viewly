// ============================================
// LOGIN PAGE - USER AUTHENTICATION
// ============================================
// Allows users to sign in with username/email and password.
// Redirects to home page after successful login.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { loginUser } from '../api/authApi';
import toast from 'react-hot-toast';
import Input from '../components/layout/ui/Input';
import Button from '../components/layout/ui/Button';

const LoginPage = () => {
    // Form state
    const [formData, setFormData] = useState({
        usernameOrEmail: '', // Can be either username or email
        password: '',
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    /**
     * HANDLE INPUT CHANGE
     * Updates form state when user types
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    /**
     * HANDLE LOGIN SUBMIT
     * Validates form, calls API, updates Redux state
     * 
     * Flow:
     * 1. Prevent page reload
     * 2. Set loading state (shows spinner)
     * 3. Call backend API
     * 4. Store token in localStorage
     * 5. Update Redux (user logged in)
     * 6. Redirect to home page
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.usernameOrEmail || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            dispatch(loginStart()); // Set loading = true in Redux

            const response = await loginUser({
                usernameOrEmail: formData.usernameOrEmail,
                password: formData.password,
            });

            // Store token for future API calls
            localStorage.setItem('accessToken', response.data.accessToken);

            // Update Redux state with user data
            dispatch(loginSuccess(response.data.user));

            toast.success('Login successful!');
            navigate('/'); // Redirect to home page
        } catch (error) {
            dispatch(loginFailure(error.message || 'Login failed'));
            toast.error(error.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 to-pink-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        VidNest
                    </h1>
                    <p className="text-gray-600 mt-2">Welcome back! Please login to continue.</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username/Email Input */}
                    <div>
                        <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-2">
                            Username or Email
                        </label>
                        <Input
                            type="text"
                            id="usernameOrEmail"
                            name="usernameOrEmail"
                            placeholder="Enter your username or email"
                            value={formData.usernameOrEmail}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="default"
                        className="w-full"
                    >
                        Login
                    </Button>
                </form>

                {/* Register Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
