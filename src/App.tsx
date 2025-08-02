import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Car, 
  Zap, 
  Utensils, 
  TrendingDown, 
  Trophy,
  Target,
  Calendar,
  BarChart3,
  Lightbulb,
  Plus,
  RotateCcw,
  Save,
  Download,
  Settings,
  X
} from 'lucide-react';

interface FormData {
  distance: string;
  electricity: string;
  dietType: 'vegetarian' | 'mixed' | 'non-veg';
}

interface DayData {
  day: string;
  footprint: number;
  date: string;
}

interface HistoricalEntry {
  date: string;
  footprint: number;
  distance: number;
  electricity: number;
  dietType: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    distance: '',
    electricity: '',
    dietType: 'mixed'
  });

  const [weeklyData, setWeeklyData] = useState<DayData[]>(() => {
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return {
        day: days[date.getDay()],
        footprint: Math.random() * 10 + 5,
        date: date.toISOString().split('T')[0]
      };
    });
  });

  const [history, setHistory] = useState<HistoricalEntry[]>([]);
  const [achievements, setAchievements] = useState({
    daysTracked: 0,
    totalReduction: 0,
    achievementsUnlocked: 0
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [personalTarget, setPersonalTarget] = useState(15);
  const [showSettings, setShowSettings] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [showResetMenu, setShowResetMenu] = useState(false);

  // Calculate carbon footprint
  const calculateFootprint = () => {
    const distance = parseFloat(formData.distance) || 0;
    const electricity = parseFloat(formData.electricity) || 0;
    
    const transportCO2 = distance * 0.21;
    const electricityCO2 = electricity * 0.82;
    
    let dietCO2 = 0;
    switch (formData.dietType) {
      case 'vegetarian':
        dietCO2 = 2.9;
        break;
      case 'mixed':
        dietCO2 = 4.7;
        break;
      case 'non-veg':
        dietCO2 = 7.2;
        break;
    }
    
    return {
      total: (transportCO2 + electricityCO2 + dietCO2),
      transport: transportCO2,
      electricity: electricityCO2,
      diet: dietCO2
    };
  };

  const footprintData = calculateFootprint();
  const totalFootprint = footprintData.total.toFixed(1);

  // Get achievement badges based on performance
  const getBadges = () => {
    const badges = [];
    const footprint = footprintData.total;
    
    if (footprint < 8) {
      badges.push({ emoji: "🌟", title: "Eco Champion", desc: "Under 8kg CO₂!" });
    } else if (footprint < 12) {
      badges.push({ emoji: "🌱", title: "Green Warrior", desc: "Under 12kg CO₂!" });
    } else if (footprint < personalTarget) {
      badges.push({ emoji: "🎯", title: "Target Achieved", desc: "Met personal goal!" });
    }
    
    if (parseFloat(formData.distance) === 0) {
      badges.push({ emoji: "🚶‍♂️", title: "Car-Free Day", desc: "Zero transport emissions!" });
    }
    
    if (formData.dietType === 'vegetarian') {
      badges.push({ emoji: "🥗", title: "Plant Powered", desc: "Vegetarian choice!" });
    }
    
    if (parseFloat(formData.electricity) < 5) {
      badges.push({ emoji: "💡", title: "Energy Saver", desc: "Low electricity use!" });
    }
    
    return badges;
  };

  // Enhanced eco tips based on input
  const getEcoTips = () => {
    const tips = [];
    const distance = parseFloat(formData.distance) || 0;
    const electricity = parseFloat(formData.electricity) || 0;

    if (distance > 30) {
      tips.push("🚲 Consider carpooling or public transport for long trips");
    } else if (distance > 15) {
      tips.push("🚶‍♂️ Try walking or biking for shorter distances");
    }
    
    if (electricity > 15) {
      tips.push("💡 Unplug devices when not in use to save energy");
    } else if (electricity > 8) {
      tips.push("🌡️ Adjust thermostat by 2°C to reduce energy consumption");
    }
    
    if (formData.dietType === 'non-veg') {
      tips.push("🥗 Try 'Meatless Monday' to reduce your food footprint");
    } else if (formData.dietType === 'mixed') {
      tips.push("🌱 Choose local and seasonal produce when possible");
    }
    
    if (tips.length === 0) {
      tips.push("🌟 Excellent! You're maintaining a low carbon footprint");
    }
    
    if (footprintData.total < 10) {
      tips.push("🏆 You're below the daily sustainable target!");
    }
    
    return tips.slice(0, 3);
  };

  // Save today's data
  const saveEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    const distance = parseFloat(formData.distance) || 0;
    const electricity = parseFloat(formData.electricity) || 0;
    
    const newEntry: HistoricalEntry = {
      date: today,
      footprint: footprintData.total,
      distance,
      electricity,
      dietType: formData.dietType
    };

    setHistory(prev => {
      const filtered = prev.filter(entry => entry.date !== today);
      return [...filtered, newEntry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    setWeeklyData(prev => {
      const updated = [...prev];
      const todayIndex = updated.findIndex(d => d.date === today);
      if (todayIndex !== -1) {
        updated[todayIndex].footprint = footprintData.total;
      }
      return updated;
    });

    setAchievements(prev => ({
      ...prev,
      daysTracked: prev.daysTracked + 1,
      totalReduction: Math.max(0, prev.totalReduction + (20 - footprintData.total) / 20 * 100),
      achievementsUnlocked: prev.achievementsUnlocked + (footprintData.total < 10 ? 1 : 0)
    }));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const resetForm = () => {
    setFormData({
      distance: '',
      electricity: '',
      dietType: 'mixed'
    });
  };

  const resetTodayData = () => {
    resetForm();
    const today = new Date().toISOString().split('T')[0];
    setHistory(prev => prev.filter(entry => entry.date !== today));
    setWeeklyData(prev => {
      const updated = [...prev];
      const todayIndex = updated.findIndex(d => d.date === today);
      if (todayIndex !== -1) {
        updated[todayIndex].footprint = Math.random() * 10 + 5; // Reset to default random value
      }
      return updated;
    });
    setShowResetMenu(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const resetAllHistory = () => {
    if (window.confirm('⚠️ This will delete ALL your tracking history. Are you sure?')) {
      // Clear history and achievements
      setHistory([]);
      setAchievements({
        daysTracked: 0,
        totalReduction: 0,
        achievementsUnlocked: 0
      });
      
      // Generate completely different weekly data with wider range
      const today = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const freshWeeklyData = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i));
        freshWeeklyData.push({
          day: days[date.getDay()],
          footprint: Math.floor(Math.random() * 15) + 3, // 3-17 kg (much wider range)
          date: date.toISOString().split('T')[0]
        });
      }
      
      setWeeklyData(freshWeeklyData);
      setShowResetMenu(false);
      setExportStatus('All history cleared! Weekly data reset.');
      setTimeout(() => setExportStatus(''), 3000);
      
      console.log('History cleared, new weekly data:', freshWeeklyData);
    }
  };

  const resetEverything = () => {
    if (window.confirm('⚠️ This will reset EVERYTHING including your personal target. Are you absolutely sure?')) {
      // Reset form
      setFormData({
        distance: '',
        electricity: '',
        dietType: 'mixed'
      });
      
      // Clear all data
      setHistory([]);
      setAchievements({
        daysTracked: 0,
        totalReduction: 0,
        achievementsUnlocked: 0
      });
      
      // Reset personal target
      setPersonalTarget(15);
      
      // Generate completely different weekly data with much wider variation
      const today = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const completelyFreshData = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i));
        completelyFreshData.push({
          day: days[date.getDay()],
          footprint: Math.floor(Math.random() * 20) + 2, // 2-21 kg (very wide range)
          date: date.toISOString().split('T')[0]
        });
      }
      
      setWeeklyData(completelyFreshData);
      setShowResetMenu(false);
      setExportStatus('Complete factory reset successful!');
      setTimeout(() => setExportStatus(''), 3000);
      
      console.log('Factory reset complete, new data:', completelyFreshData);
    }
  };

  // Export as readable text format
  const exportAsText = () => {
    try {
      setExportStatus('Preparing export...');
      
      const today = new Date();
      const textContent = `
=== ECOTRACK CARBON FOOTPRINT REPORT ===
Generated: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}

CURRENT STATUS:
- Today's Carbon Footprint: ${totalFootprint} kg CO₂
- Personal Target: ${personalTarget} kg CO₂ per day
- Target Status: ${footprintData.total <= personalTarget ? '✅ ACHIEVED' : '❌ OVER TARGET'}

TODAY'S BREAKDOWN:
- Transport: ${footprintData.transport.toFixed(1)} kg CO₂ (${formData.distance || 0} km traveled)
- Electricity: ${footprintData.electricity.toFixed(1)} kg CO₂ (${formData.electricity || 0} kWh used)
- Diet: ${footprintData.diet.toFixed(1)} kg CO₂ (${formData.dietType} diet)

WEEKLY PROGRESS:
${weeklyData.map(day => 
  `${day.day}: ${day.footprint.toFixed(1)} kg CO₂ ${day.footprint <= personalTarget * 0.8 ? '⭐' : ''}`
).join('\n')}
- Weekly Average: ${avgWeeklyFootprint.toFixed(1)} kg CO₂

ACHIEVEMENTS:
- Days Tracked: ${achievements.daysTracked}
- CO₂ Reduction: ${achievements.totalReduction.toFixed(0)}%
- Green Days: ${achievements.achievementsUnlocked}

${currentBadges.length > 0 ? `TODAY'S BADGES:
${currentBadges.map(badge => `${badge.emoji} ${badge.title}: ${badge.desc}`).join('\n')}` : ''}

ECO TIPS:
${getEcoTips().map(tip => `• ${tip}`).join('\n')}

${history.length > 0 ? `RECENT HISTORY:
${history.slice(0, 10).map(entry => 
  `${entry.date}: ${entry.footprint.toFixed(1)} kg CO₂ (${entry.distance}km, ${entry.electricity}kWh, ${entry.dietType})`
).join('\n')}` : 'No history data available yet.'}

=== END OF REPORT ===
`;
      
      // Create and trigger download
      const dataBlob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `EcoTrack-Report-${new Date().toISOString().split('T')[0]}.txt`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      setExportStatus('Text report downloaded!');
      setTimeout(() => setExportStatus(''), 3000);
      
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('Export failed - please try again');
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  // Copy to clipboard for easy pasting
  const copyToClipboard = async () => {
    try {
      setExportStatus('Copying to clipboard...');
      
      const today = new Date();
      const textContent = `=== ECOTRACK REPORT (${today.toLocaleDateString()}) ===

Today's Carbon Footprint: ${totalFootprint} kg CO₂
Personal Target: ${personalTarget} kg CO₂
Status: ${footprintData.total <= personalTarget ? '✅ Target Achieved' : '❌ Over Target'}

Breakdown:
• Transport: ${footprintData.transport.toFixed(1)} kg CO₂ (${formData.distance || 0} km)
• Electricity: ${footprintData.electricity.toFixed(1)} kg CO₂ (${formData.electricity || 0} kWh)
• Diet: ${footprintData.diet.toFixed(1)} kg CO₂ (${formData.dietType})

Weekly Progress:
${weeklyData.map(day => `${day.day}: ${day.footprint.toFixed(1)} kg`).join(', ')}
Average: ${avgWeeklyFootprint.toFixed(1)} kg CO₂

Achievements: ${achievements.daysTracked} days tracked, ${achievements.achievementsUnlocked} green days

${currentBadges.length > 0 ? `Today's Badges: ${currentBadges.map(b => b.title).join(', ')}` : ''}`;
      
      await navigator.clipboard.writeText(textContent);
      setExportStatus('Copied to clipboard!');
      setTimeout(() => setExportStatus(''), 3000);
      
    } catch (error) {
      console.error('Copy failed:', error);
      setExportStatus('Copy failed - manual selection needed');
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const currentBadges = getBadges();
  const maxWeeklyFootprint = Math.max(...weeklyData.map(d => d.footprint));
  const avgWeeklyFootprint = weeklyData.reduce((acc, d) => acc + d.footprint, 0) / weeklyData.length;

  const getFootprintColor = (footprint: number) => {
    if (footprint < personalTarget * 0.6) return 'text-green-600';
    if (footprint < personalTarget) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFootprintBgColor = (footprint: number) => {
    if (footprint < personalTarget * 0.6) return 'bg-green-500';
    if (footprint < personalTarget) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Data saved successfully!</span>
        </div>
      )}

      {/* Export Status Message */}
      {exportStatus && (
        <div className={`fixed top-16 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
          exportStatus.includes('successful') ? 'bg-green-500 text-white' : 
          exportStatus.includes('failed') ? 'bg-red-500 text-white' : 
          'bg-blue-500 text-white'
        }`}>
          <Download className="h-4 w-4" />
          <span>{exportStatus}</span>
        </div>
      )}

      {/* Reset Menu */}
      {showResetMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Reset Options</h3>
              <button onClick={() => setShowResetMenu(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  resetForm();
                  setShowResetMenu(false);
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 2000);
                }}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="font-semibold text-gray-900">🔄 Clear Today's Form</div>
                <div className="text-sm text-gray-600">Reset distance, electricity, and diet inputs</div>
              </button>
              
              <button
                onClick={resetTodayData}
                className="w-full text-left p-4 rounded-xl border border-yellow-200 hover:bg-yellow-50 transition-colors"
              >
                <div className="font-semibold text-yellow-800">📅 Reset Today's Data</div>
                <div className="text-sm text-yellow-600">Clear form + remove today's saved entry</div>
              </button>
              
              <button
                onClick={resetAllHistory}
                className="w-full text-left p-4 rounded-xl border border-orange-200 hover:bg-orange-50 transition-colors"
              >
                <div className="font-semibold text-orange-800">📊 Clear All History</div>
                <div className="text-sm text-orange-600">Delete all tracking data and achievements</div>
              </button>
              
              <button
                onClick={resetEverything}
                className="w-full text-left p-4 rounded-xl border border-red-200 hover:bg-red-50 transition-colors"
              >
                <div className="font-semibold text-red-800">🔥 Factory Reset</div>
                <div className="text-sm text-red-600">Reset everything including personal goals</div>
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> Export your data before resetting to keep a backup!
              </div>
            </div>
          </div>
        </div>
      )}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Personal Goals</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Daily CO₂ Target (kg)
                </label>
                <input
                  type="number"
                  value={personalTarget}
                  onChange={(e) => setPersonalTarget(parseFloat(e.target.value) || 15)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  min="5"
                  max="50"
                  step="0.5"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Recommended: 10-15 kg CO₂ per day
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-sm text-gray-600">
                  Your current footprint: <span className="font-semibold">{totalFootprint} kg CO₂</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {footprintData.total < personalTarget ? 
                    `✅ ${(personalTarget - footprintData.total).toFixed(1)}kg under your target!` :
                    `⚠️ ${(footprintData.total - personalTarget).toFixed(1)}kg over your target`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-500 p-2 rounded-full">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">EcoTrack</h1>
                <p className="text-emerald-600 font-medium">Track Today. Save Tomorrow.</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getFootprintColor(footprintData.total)}`}>
                  {totalFootprint}
                </div>
                <div className="text-sm text-gray-500">kg CO₂ today</div>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Goals</span>
              </button>
              
              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={copyToClipboard}
                  disabled={exportStatus.includes('Copying') || exportStatus.includes('Preparing')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors mr-2 ${
                    exportStatus.includes('Copying') || exportStatus.includes('Preparing')
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Copy</span>
                </button>
              </div>
              
              <button
                onClick={exportAsText}
                disabled={exportStatus.includes('Preparing')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  exportStatus.includes('Preparing') 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="h-6 w-6 text-emerald-500 mr-2" />
                Daily Tracker
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Car className="h-4 w-4 text-emerald-500 mr-2" />
                    Distance Traveled (km)
                  </label>
                  <input
                    type="number"
                    value={formData.distance}
                    onChange={(e) => handleInputChange('distance', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter distance in km"
                    min="0"
                    step="0.1"
                  />
                  {footprintData.transport > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Transport CO₂: {footprintData.transport.toFixed(1)} kg
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Zap className="h-4 w-4 text-emerald-500 mr-2" />
                    Electricity Used (kWh)
                  </label>
                  <input
                    type="number"
                    value={formData.electricity}
                    onChange={(e) => handleInputChange('electricity', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter electricity in kWh"
                    min="0"
                    step="0.1"
                  />
                  {footprintData.electricity > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Electricity CO₂: {footprintData.electricity.toFixed(1)} kg
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Utensils className="h-4 w-4 text-emerald-500 mr-2" />
                    Diet Type
                  </label>
                  <select
                    value={formData.dietType}
                    onChange={(e) => handleInputChange('dietType', e.target.value as FormData['dietType'])}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="vegetarian">Vegetarian</option>
                    <option value="mixed">Mixed Diet</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                  <div className="text-xs text-gray-500 mt-1">
                    Diet CO₂: {footprintData.diet.toFixed(1)} kg
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={saveEntry}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Entry</span>
                  </button>
                  <button
                    onClick={resetForm}
                    title="Clear form inputs"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowResetMenu(true)}
                    title="More reset options"
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-3 rounded-xl transition-colors font-semibold"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results and Charts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingDown className="h-5 w-5 text-emerald-500 mr-2" />
                  Today's Footprint
                </h3>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getFootprintColor(footprintData.total)}`}>
                    {totalFootprint}
                  </div>
                  <div className="text-gray-500">kg CO₂</div>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${getFootprintBgColor(footprintData.total)}`}
                      style={{ width: `${Math.min((footprintData.total / personalTarget) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Personal target: {personalTarget}kg CO₂</div>
                  <div className="text-xs text-gray-400">Weekly avg: {avgWeeklyFootprint.toFixed(1)}kg</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
                  Eco Tips
                </h3>
                <div className="space-y-3">
                  {getEcoTips().map((tip, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="bg-emerald-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                        <Leaf className="h-3 w-3 text-emerald-600" />
                      </div>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
                
                {/* Achievement Badges */}
                {currentBadges.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm font-semibold text-gray-700 mb-2">🏆 Today's Badges</div>
                    <div className="flex flex-wrap gap-2">
                      {currentBadges.map((badge, index) => (
                        <div key={index} className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg px-3 py-1">
                          <div className="flex items-center space-x-1">
                            <span className="text-lg">{badge.emoji}</span>
                            <div>
                              <div className="text-xs font-semibold text-amber-700">{badge.title}</div>
                              <div className="text-xs text-amber-600">{badge.desc}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="h-5 w-5 text-emerald-500 mr-2" />
                Weekly Progress
              </h3>
              <div className="flex items-end justify-between h-32">
                {weeklyData.map((data, index) => {
                  const isToday = data.date === new Date().toISOString().split('T')[0];
                  const isUnderTarget = data.footprint < personalTarget * 0.8;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className={`w-8 bg-gray-200 rounded-t-lg mb-2 relative ${isToday ? 'ring-2 ring-emerald-400' : ''}`}>
                        <div 
                          className={`rounded-t-lg transition-all duration-500 w-full ${
                            data.footprint < personalTarget * 0.6 ? 'bg-gradient-to-t from-green-500 to-green-400' :
                            data.footprint < personalTarget ? 'bg-gradient-to-t from-yellow-500 to-yellow-400' :
                            'bg-gradient-to-t from-red-500 to-red-400'
                          }`}
                          style={{ height: `${Math.max((data.footprint / maxWeeklyFootprint) * 100, 5)}%` }}
                        ></div>
                        {isUnderTarget && (
                          <div className="absolute -top-2 -right-1 text-xs">⭐</div>
                        )}
                      </div>
                      <div className={`text-xs font-medium ${isToday ? 'text-emerald-600' : 'text-gray-600'}`}>
                        {data.day}
                      </div>
                      <div className="text-xs text-gray-500">{data.footprint.toFixed(1)}kg</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Eco Achievements */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                Eco Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">{achievements.daysTracked}</div>
                  <div className="text-sm text-gray-600">Days Tracked</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl">
                  <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{achievements.totalReduction.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">CO₂ Saved</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                  <div className="bg-amber-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-amber-600">{achievements.achievementsUnlocked}</div>
                  <div className="text-sm text-gray-600">Green Days</div>
                </div>
              </div>
            </div>

            {/* Recent History */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 text-emerald-500 mr-2" />
                  Recent Entries
                </h3>
                <div className="space-y-2">
                  {history.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="text-sm text-gray-600">{entry.date}</div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500">{entry.distance}km • {entry.electricity}kWh</span>
                        <span className={`text-sm font-semibold ${getFootprintColor(entry.footprint)}`}>
                          {entry.footprint.toFixed(1)}kg CO₂
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;