// client/src/pages/ProfilePage.jsx (FINAL & COMPLETE)

import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Camera, ArrowLeft, Edit, KeyRound } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { updateUserProfile, uploadAndUpdateProfilePhoto } from "../store/slices/authSlice";
import { changePassword } from "../utils/api";
import { motion } from "framer-motion";
import "./ProfilePage.css";

import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog";

const ChangePasswordDialog = () => {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (passwords.newPassword.length < 6) { return setError("New password must be at least 6 characters."); }
    if (passwords.newPassword !== passwords.confirmPassword) { return setError("New passwords do not match."); }
    setIsChanging(true);
    try {
      const res = await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setSuccess(res.message);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <DialogContent className="bg-[#161b22] border-slate-700 text-white">
      <DialogHeader>
        <DialogTitle>Change Your Password</DialogTitle>
        <DialogDescription>Enter your current password and a new password.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-1">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input id="currentPassword" name="currentPassword" type="password" value={passwords.currentPassword} onChange={handleChange} required className="bg-slate-800 border-slate-600" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="newPassword">New Password</Label>
          <Input id="newPassword" name="newPassword" type="password" value={passwords.newPassword} onChange={handleChange} required className="bg-slate-800 border-slate-600" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={handleChange} required className="bg-slate-800 border-slate-600" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isChanging} className="bg-indigo-600 hover:bg-indigo-500">
            {isChanging ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};


const ProfilePage = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "", department: "", year: "", interests: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        department: user.department || "",
        year: user.year || "",
        interests: user.interests?.join(", ") || "",
      });
    }
  }, [user]);

  const handleAvatarClick = () => fileInputRef.current.click();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await dispatch(uploadAndUpdateProfilePhoto(file)).unwrap();
      alert("Profile photo updated successfully!");
    } catch (error) {
      alert(error || "Failed to upload photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const interestsArray = formData.interests.split(',').map(item => item.trim()).filter(Boolean);
      await dispatch(updateUserProfile({ ...formData, interests: interestsArray })).unwrap();
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert(error || "Failed to update profile.");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({ name: user.name, department: user.department, year: user.year, interests: user.interests.join(", ") });
    }
    setEditing(false);
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0d1117]"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div></div>;
  }

  return (
    <div className="min-h-screen w-full profile-gradient-background text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 text-gray-400 hover:bg-slate-800 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        <motion.div 
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <motion.div variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } }} className="lg:col-span-1">
            <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 h-full flex flex-col items-center text-center">
              <div className="relative group flex-shrink-0">
                <Avatar className="w-32 h-32 text-5xl border-4 border-slate-700 transition-all group-hover:border-indigo-500">
                  <AvatarImage src={user.profilePhotoUrl} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div onClick={handleAvatarClick} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {isUploading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div> : <Camera className="h-10 w-10 text-white" />}
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

              <h1 className="text-3xl font-bold text-white mt-4">{user.name}</h1>
              <p className="text-indigo-400">{user.email}</p>
              <div className="w-full border-t border-slate-700 my-6"></div>
              <div className="text-left w-full space-y-2">
                <p><strong className="text-slate-400">Department:</strong> {user.department}</p>
                <p><strong className="text-slate-400">Year:</strong> {user.year}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } }} className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Profile Details</h2>
                {!editing && (
                  <Button variant="ghost" size="icon" onClick={() => setEditing(true)} className="text-slate-400 hover:text-white hover:bg-slate-700">
                    <Edit className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <form onSubmit={handleSaveChanges} className="space-y-4">
                {/* <<< --- YAHAN PAR POORA FORM ADD KAR DIYA GAYA HAI --- >>> */}
                <div>
                  <Label htmlFor="name" className="text-slate-400">Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!editing} className="bg-slate-800 border-slate-600 focus:ring-indigo-500 input-disabled-style" />
                </div>
                <div>
                  <Label htmlFor="department" className="text-slate-400">Department</Label>
                  <Input id="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} disabled={!editing} className="bg-slate-800 border-slate-600 focus:ring-indigo-500 input-disabled-style"/>
                </div>
                <div>
                  <Label htmlFor="year" className="text-slate-400">Year of Study</Label>
                  <Input id="year" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} disabled={!editing} className="bg-slate-800 border-slate-600 focus:ring-indigo-500 input-disabled-style"/>
                </div>
                <div>
                  <Label htmlFor="interests" className="text-slate-400">Interests (comma separated)</Label>
                  <Input id="interests" value={formData.interests} onChange={(e) => setFormData({ ...formData, interests: e.target.value })} disabled={!editing} placeholder="e.g., Programming, Music, Sports..." className="bg-slate-800 border-slate-600 focus:ring-indigo-500 input-disabled-style"/>
                </div>
                {editing && (
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={handleCancel} className="hover:bg-slate-700">Cancel</Button>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </form>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-4">Security</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-transparent border-slate-600 hover:bg-slate-800 hover:border-indigo-500">
                    <KeyRound className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <ChangePasswordDialog />
              </Dialog>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;