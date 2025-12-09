// ============================================
// REGISTER PAGE - USER REGISTRATION
// ============================================
// Allows new users to create an account with avatar upload.
// Redirects to home page after successful registration.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { registerUser } from '../api/authApi';
import toast from 'react-hot-toast';
import Input from '../components/layout/ui/Input';
import Button from '../components/layout/ui/Button';

const RegisterPage = () => {
    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        password: '',
        confirmPassword: '',
    });
    const [avatar, setAvatar] = useState(null); // File object for avatar
    const [coverImage, setCoverImage] = useState(null); // File object for cover image

    const navigate = useNavigate();
    const dispatch = useDispatch();

    /**
     * HANDLE INPUT CHANGE
     * Updates text form fields
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    /**
     * HANDLE FILE CHANGE
     * Stores selected image file
     */
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            if (name === 'avatar') {
                setAvatar(files[0]);
            } else if (name === 'coverImage') {
                setCoverImage(files[0]);
            }
        }
    };

    /**
     * HANDLE REGISTER SUBMIT
     * Validates form, creates FormData, calls API
     * 
     * Flow:
     * 1. Validate all required fields
     * 2. Check password match
     * 3. Create FormData (required for file upload)
     * 4. Call backend API
     * 5. Store token and update Redux
     * 6. Redirect to home page
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.username || !formData.email || !formData.fullName || !formData.password) {
            toast.error('⚠️ Please fill in all required fields (marked with *)');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('❌ Passwords don\'t match. Please re-enter.');
            return;
        }

        if (formData.password.length < 8) {
            toast.error('⚠️ Password must be at least 8 characters long');
            return;
        }

        if (!avatar) {
            toast.error('📸 Please upload a profile picture (avatar)');
            return;
        }

        try {
            dispatch(loginStart()); // Set loading = true

            // Create FormData for file upload
            const data = new FormData();
            data.append('username', formData.username);
            data.append('email', formData.email);
            data.append('fullName', formData.fullName);
            data.append('password', formData.password);
            data.append('avatar', avatar);
            if (coverImage) {
                data.append('coverImage', coverImage);
            }

            const response = await registerUser(data);

            // Store token
            localStorage.setItem('accessToken', response.data.accessToken);

            // Update Redux state
            dispatch(loginSuccess(response.data.user));

            toast.success(`🎉 Welcome to VidNest, ${formData.username}! Your account is ready.`);
            navigate('/'); // Redirect to home
        } catch (error) {
            dispatch(loginFailure(error.message || 'Registration failed'));
            // Provide helpful error messages
            const errorMessage = error.message || 'Unable to create account. Please try again.';
            if (errorMessage.includes('already exists')) {
                toast.error('❌ This username or email is already taken. Please try another.');
            } else if (errorMessage.includes('avatar')) {
                toast.error('❌ Failed to upload avatar. Please try a different image.');
            } else {
                toast.error(`❌ ${errorMessage}`);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 to-pink-50 px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        VidNest
                    </h1>
                    <p className="text-gray-600 mt-2">Create your account to get started.</p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            Username *
                        </label>
                        <Input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Choose a unique username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Full Name */}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <Input
                            type="text"
                            id="fullName"
                            name="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                        </label>
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Minimum 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password *
                        </label>
                        <Input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Re-enter password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Avatar Upload */}
                    <div>
                        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
                            Avatar * (Profile Picture)
                        </label>
                        <input
                            type="file"
                            id="avatar"
                            name="avatar"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Cover Image Upload (Optional) */}
                    <div>
                        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
                            Cover Image (Optional)
                        </label>
                        <input
                            type="file"
                            id="coverImage"
                            name="coverImage"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="default"
                        className="w-full"
                    >
                        Create Account
                    </Button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
