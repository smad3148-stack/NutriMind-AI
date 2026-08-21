import React, { useState } from 'react';
import { Heart, Share2, Award, Sparkles, UserPlus, MessageSquare, Flame } from 'lucide-react';

export const TweakWallSection: React.FC = () => {
  const [likes, setLikes] = useState({ recipe: 124, post1: 45, post2: 89, post3: 31 });
  const [liked, setLiked] = useState({ recipe: false, post1: false, post2: false, post3: false });

  const handleToggleLike = (id: 'recipe' | 'post1' | 'post2' | 'post3') => {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
    setLikes(prev => ({ ...prev, [id]: prev[id] + (liked[id] ? -1 : 1) }));
  };

  const sampleRecipe = {
    title: 'Avocado Quinoa Longevity Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    type: 'Veg',
    calories: 420,
    protein: '28g',
    description: 'High-fiber, anti-inflammatory metabolic bowl mixed with organic quinoa, Hass avocados, steamed broccoli florets, and light ginger-turmeric dressing.'
  };

  const tweakFeed = [
    {
      id: 'post1' as const,
      user: 'Shobha R.',
      userImg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      foodImg: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=300&q=80',
      calories: 310,
      protein: 14,
      fat: 6,
      carbs: 45,
      fibre: 8,
      advice: 'Great choice Shobha. I appreciate you for having moong dal chilla and curd. Swapping regular curd for Greek yogurt and adding a cucumber salad will lower the overall meal glycemic load by 15%.'
    },
    {
      id: 'post2' as const,
      user: 'Rahul K.',
      userImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      foodImg: 'https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?auto=format&fit=crop&w=300&q=80',
      calories: 280,
      protein: 10,
      fat: 4,
      carbs: 52,
      fibre: 9,
      advice: 'Excellent high-fiber prebiotic meal, Rahul. Swapping wildflower honey for monk fruit sweet drops keeps insulin spikes at zero while fully sustaining glycogen storage.'
    },
    {
      id: 'post3' as const,
      user: 'Anita Roy',
      userImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      foodImg: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=300&q=80',
      calories: 450,
      protein: 38,
      fat: 22,
      carbs: 8,
      fibre: 3,
      advice: 'Incredible Omega-3 fat profile, Anita. Pair with steamed organic broccoli to double trace mineral absorption and block free-radical cellular oxidation.'
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. RECIPE OF THE DAY */}
      <div className="space-y-2.5">
        <h4 className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
          Recipe of the Day
        </h4>

        <div className="vision-card-3d overflow-hidden relative group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          {/* Cover image */}
          <div className="h-44 relative">
            <img src={sampleRecipe.image} alt={sampleRecipe.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            {/* Badge type */}
            <span className="absolute top-3 left-3 vision-button-3d text-slate-950 text-[8px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-full">
              {sampleRecipe.type}
            </span>

            {/* Protein & Calories labels */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              <div>
                <h5 className="font-display font-bold text-sm text-white">{sampleRecipe.title}</h5>
                <p className="text-[9px] text-cyan-300 font-mono mt-0.5">{sampleRecipe.calories} kcal • {sampleRecipe.protein} Protein</p>
              </div>
            </div>
          </div>

          {/* Description & Action buttons */}
          <div className="p-4 space-y-3">
            <p className="text-[10px] text-slate-300 leading-relaxed italic">
              "{sampleRecipe.description}"
            </p>

            <div className="flex justify-between items-center border-t border-white/10 pt-3">
              <div className="flex gap-3">
                <button 
                  onClick={() => handleToggleLike('recipe')}
                  className={`flex items-center gap-1 text-[10px] transition ${liked.recipe ? 'text-rose-400' : 'text-slate-400 hover:text-white'}`}
                >
                  <Heart size={12} className={liked.recipe ? 'fill-rose-400' : ''} />
                  <span>{likes.recipe} likes</span>
                </button>
              </div>

              <button className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-cyan-400 transition">
                <Share2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TWEAK WALL */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
          tweak & eat Feed
        </h4>

        <div className="space-y-4">
          {tweakFeed.map((post) => (
            <div key={post.id} className="bg-slate-900/80 border border-white/10 p-4 rounded-3xl space-y-3 shadow-xl backdrop-blur-xl">
              
              {/* User info */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img src={post.userImg} alt={post.user} className="w-8 h-8 rounded-full border border-cyan-500/30 object-cover" />
                  <div>
                    <h5 className="font-bold text-white text-xs leading-none">{post.user}</h5>
                    <p className="text-[8px] text-slate-400 font-mono mt-0.5">Verified athlete</p>
                  </div>
                </div>
                <button className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-full px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider transition">
                  Follow
                </button>
              </div>

              {/* Food image */}
              <div className="h-32 rounded-2xl overflow-hidden border border-white/10 relative">
                <img src={post.foodImg} alt="plate" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                
                {/* Calories badge */}
                <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur text-[9px] font-mono font-bold text-cyan-400 px-2 py-0.5 rounded border border-white/10">
                  {post.calories} kcal
                </span>
              </div>

              {/* Advice */}
              <div className="bg-slate-950/60 border border-cyan-500/20 p-3 rounded-2xl space-y-1.5 relative">
                <div className="flex items-center gap-1 text-[8px] font-mono text-cyan-400 font-bold">
                  <Sparkles size={11} /> AI METABOLIC RECOMMENDATION
                </div>
                <p className="text-[10px] text-slate-200 leading-relaxed italic">
                  "{post.advice}"
                </p>
              </div>

              {/* Macro pills */}
              <div className="grid grid-cols-5 gap-1.5 text-center text-[8px] font-mono">
                <div className="bg-slate-950/40 p-1 rounded-lg border border-white/5">
                  <span className="text-slate-400 block leading-none">Calories</span>
                  <span className="text-white font-bold block mt-1">{post.calories}</span>
                </div>
                <div className="bg-slate-950/40 p-1 rounded-lg border border-white/5">
                  <span className="text-slate-400 block leading-none">Protein</span>
                  <span className="text-white font-bold block mt-1">{post.protein}g</span>
                </div>
                <div className="bg-slate-950/40 p-1 rounded-lg border border-white/5">
                  <span className="text-slate-400 block leading-none">Fat</span>
                  <span className="text-white font-bold block mt-1">{post.fat}g</span>
                </div>
                <div className="bg-slate-950/40 p-1 rounded-lg border border-white/5">
                  <span className="text-slate-400 block leading-none">Carbs</span>
                  <span className="text-white font-bold block mt-1">{post.carbs}g</span>
                </div>
                <div className="bg-slate-950/40 p-1 rounded-lg border border-white/5">
                  <span className="text-slate-400 block leading-none">Fibre</span>
                  <span className="text-white font-bold block mt-1">{post.fibre}g</span>
                </div>
              </div>

              {/* Likes & Comments */}
              <div className="flex justify-between items-center border-t border-white/10 pt-2.5 text-[10px] text-slate-400">
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1 transition ${liked[post.id] ? 'text-rose-400' : 'hover:text-white'}`}
                  >
                    <Heart size={11} className={liked[post.id] ? 'fill-rose-400' : ''} />
                    <span>{likes[post.id]} likes</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-white transition">
                    <MessageSquare size={11} />
                    <span>4 comments</span>
                  </button>
                </div>
                <span className="text-[8px] font-mono">2h ago</span>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
