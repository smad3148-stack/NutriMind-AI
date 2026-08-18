import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Camera, Trash2, Sparkles, User, Heart, ShieldAlert, Activity, 
  Users, Check, Phone, Plus, Calendar, Scale, Ruler, AlertCircle
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  setProfileName: (n: string) => void;
  profilePhone: string;
  setProfilePhone: (p: string) => void;
  profileAvatar: string;
  setProfileAvatar: (a: string) => void;
  userGoal: 'Weight Loss' | 'Weight Gain' | 'Maintain';
  setUserGoal: (g: 'Weight Loss' | 'Weight Gain' | 'Maintain') => void;
  onTriggerToast: (msg: string) => void;
}

const AI_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profileName,
  setProfileName,
  profilePhone,
  setProfilePhone,
  profileAvatar,
  setProfileAvatar,
  userGoal,
  setUserGoal,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'health' | 'emergency' | 'family'>('basic');

  // Form Fields
  const [tempName, setTempName] = useState(profileName || 'Utpal Bikash Deb');
  const [tempPhone, setTempPhone] = useState(profilePhone || '+918787642594');
  const [tempAvatar, setTempAvatar] = useState(profileAvatar);
  const [nickname, setNickname] = useState('Utpal');
  const [dob, setDob] = useState('1998-05-14');
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(72);
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [diseases, setDiseases] = useState('None');
  const [allergies, setAllergies] = useState('Peanut, Lactose');
  const [emergencyName, setEmergencyName] = useState('Sunita Deb');
  const [emergencyPhone, setEmergencyPhone] = useState('+919862123456');

  // Family members list
  const [familyMembers, setFamilyMembers] = useState([
    { id: 'f1', name: 'Sunita Deb', relation: 'Spouse', goal: 'Maintain' },
    { id: 'f2', name: 'Aarav Deb', relation: 'Son', goal: 'Weight Gain' }
  ]);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyRelation, setNewFamilyRelation] = useState('Spouse');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempAvatar(url);
      onTriggerToast('New profile photo uploaded successfully!');
    }
  };

  const handleDeleteAvatar = () => {
    setTempAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80');
    onTriggerToast('Profile picture removed (default avatar set).');
  };

  const handleSaveAll = () => {
    setProfileName(tempName);
    setProfilePhone(tempPhone);
    setProfileAvatar(tempAvatar);
    onTriggerToast('Profile and health parameters updated successfully!');
    onClose();
  };

  const handleAddFamilyMember = () => {
    if (!newFamilyName.trim()) return;
    setFamilyMembers(prev => [
      ...prev,
      { id: 'fam_' + Date.now(), name: newFamilyName, relation: newFamilyRelation, goal: 'Maintain' }
    ]);
    setNewFamilyName('');
    onTriggerToast('Family profile added!');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/80">
            <span className="font-display font-black text-xs uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <User size={14} /> Edit Profile & Bio-Details
            </span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Sub-Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 border-b border-white/10 text-[10px]">
            {(['basic', 'health', 'emergency', 'family'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-1.5 rounded-xl font-bold capitalize transition ${
                  activeTab === tab ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'basic' ? 'Basic Info' : tab === 'health' ? 'Vitals & Goals' : tab === 'emergency' ? 'Emergency' : 'Family'}
              </button>
            ))}
          </div>

          {/* Body content */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs no-scrollbar">
            
            {/* BASIC INFO TAB */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                {/* Profile Picture Actions */}
                <div className="bg-slate-900/80 border border-white/10 p-3.5 rounded-2xl flex items-center gap-3">
                  <img
                    src={tempAvatar}
                    alt="profile"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-lg shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <label className="block text-[9px] font-mono font-bold text-cyan-400 uppercase">Profile Photo Actions</label>
                    <div className="flex flex-wrap gap-1.5">
                      <label className="cursor-pointer bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1">
                        <Camera size={11} /> Upload
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={handleDeleteAvatar}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Avatars Preset Selection */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <Sparkles size={11} className="text-cyan-400" /> Select AI Generated Avatar
                  </label>
                  <div className="grid grid-cols-6 gap-2 bg-slate-900/60 p-2 rounded-2xl border border-white/10">
                    {AI_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setTempAvatar(url); onTriggerToast('AI Avatar selected!'); }}
                        className={`rounded-xl overflow-hidden border-2 transition ${tempAvatar === url ? 'border-cyan-400 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={url} alt={`avatar-${idx}`} className="w-10 h-10 object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3 bg-slate-900/80 border border-white/10 p-3.5 rounded-2xl">
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Nickname</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={e => setNickname(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={tempPhone}
                      onChange={e => setTempPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* HEALTH & VITALS TAB */}
            {activeTab === 'health' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/80 border border-white/10 p-3 rounded-2xl">
                    <label className="text-[9px] font-mono text-cyan-400 uppercase block mb-1 font-bold">Height (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={e => setHeightCm(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="bg-slate-900/80 border border-white/10 p-3 rounded-2xl">
                    <label className="text-[9px] font-mono text-cyan-400 uppercase block mb-1 font-bold">Weight (kg)</label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={e => setWeightKg(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-white/10 p-3.5 rounded-2xl space-y-3">
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Medical Conditions / Diseases</label>
                    <input
                      type="text"
                      value={diseases}
                      onChange={e => setDiseases(e.target.value)}
                      placeholder="e.g. Type 2 Diabetes, Hypertension, None"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Food / Drug Allergies</label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={e => setAllergies(e.target.value)}
                      placeholder="e.g. Peanut, Gluten, Dairy, Shellfish"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Primary Fitness Goal</label>
                    <select
                      value={userGoal}
                      onChange={e => setUserGoal(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Weight Loss">Weight Loss (Fat Loss Deficit)</option>
                      <option value="Weight Gain">Weight Gain (Muscle Building Surplus)</option>
                      <option value="Maintain">Maintain Weight & Recomp</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* EMERGENCY CONTACTS TAB */}
            {activeTab === 'emergency' && (
              <div className="space-y-3">
                <div className="bg-slate-900/80 border border-white/10 p-3.5 rounded-2xl space-y-3">
                  <span className="text-[9px] font-mono text-rose-400 uppercase font-bold tracking-wider block flex items-center gap-1">
                    <ShieldAlert size={12} /> Primary SOS Contact
                  </span>

                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={e => setEmergencyName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1">Emergency Phone Number</label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={e => setEmergencyPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FAMILY PROFILES TAB */}
            {activeTab === 'family' && (
              <div className="space-y-3">
                <div className="bg-slate-900/80 border border-white/10 p-3.5 rounded-2xl space-y-3">
                  <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold tracking-wider block flex items-center gap-1">
                    <Users size={12} /> Family Members Linked ({familyMembers.length})
                  </span>

                  <div className="space-y-2">
                    {familyMembers.map(fm => (
                      <div key={fm.id} className="bg-slate-950 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                        <div>
                          <h6 className="font-bold text-white text-xs">{fm.name} ({fm.relation})</h6>
                          <span className="text-[9px] text-cyan-400 font-mono">Goal: {fm.goal}</span>
                        </div>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">ACTIVE</span>
                      </div>
                    ))}
                  </div>

                  {/* Add Family Form */}
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block">Add Family Member</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Member Name"
                        value={newFamilyName}
                        onChange={e => setNewFamilyName(e.target.value)}
                        className="bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                      <select
                        value={newFamilyRelation}
                        onChange={e => setNewFamilyRelation(e.target.value)}
                        className="bg-slate-950 border border-white/10 rounded-xl px-2 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                      >
                        <option value="Spouse">Spouse</option>
                        <option value="Child">Child</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddFamilyMember}
                      className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1"
                    >
                      <Plus size={13} /> Add Family Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Save Actions */}
          <div className="p-4 border-t border-white/10 bg-slate-950 flex gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20"
            >
              Save Profile Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 font-bold rounded-2xl text-xs hover:bg-white/10 transition"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
