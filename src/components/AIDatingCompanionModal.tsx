import React, { useState, useEffect, useRef } from 'react';
import { Participant, MatchResult } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ActivityCard {
  id: string;
  title: string;
  description: string;
  icebreaker: string;
  vibe: string;
}

interface AIDatingCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  matches: MatchResult[];
  currentParticipantId?: string;
  currentParticipantName?: string;
  isAdmin?: boolean;
}

export const AIDatingCompanionModal: React.FC<AIDatingCompanionModalProps> = ({
  isOpen,
  onClose,
  participants,
  matches,
  currentParticipantId,
  currentParticipantName,
  isAdmin = false,
}) => {
  // If admin or preview mode, allow selecting which participant's session to view
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');

  // Active view tab inside companion
  const [activeTab, setActiveTab] = useState<'chat' | 'recap' | 'activities'>('chat');

  // Chat conversation state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Recap note state
  const [dateNotes, setDateNotes] = useState('');
  const [recapResult, setRecapResult] = useState<string | null>(null);
  const [isRecapping, setIsRecapping] = useState(false);

  // Swipeable date activities
  const [activities, setActivities] = useState<ActivityCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [activityReactions, setActivityReactions] = useState<Record<string, 'liked' | 'done' | 'skipped'>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-select initial participant
  useEffect(() => {
    if (currentParticipantId) {
      setSelectedParticipantId(currentParticipantId);
    } else if (currentParticipantName) {
      const found = participants.find(
        p => p.name.toLowerCase() === currentParticipantName.toLowerCase()
      );
      if (found) setSelectedParticipantId(found.id);
      else if (participants[0]) setSelectedParticipantId(participants[0].id);
    } else if (participants[0]) {
      setSelectedParticipantId(participants[0].id);
    }
  }, [currentParticipantId, currentParticipantName, participants, isOpen]);

  // Determine participant and their EXCLUSIVELY matched partner
  const currentParticipant = participants.find(p => p.id === selectedParticipantId);

  // Find their official paired match
  const officialMatch = matches.find(
    m =>
      (currentParticipant && (m.maleId === currentParticipant.id || m.femaleId === currentParticipant.id)) ||
      (currentParticipant &&
        (m.maleName.toLowerCase() === currentParticipant.name.toLowerCase() ||
          m.femaleName.toLowerCase() === currentParticipant.name.toLowerCase()))
  );

  // Identify partner from the match
  const isMale = currentParticipant?.gender === 'Male';
  const partnerName = officialMatch ? (isMale ? officialMatch.femaleName : officialMatch.maleName) : null;
  const partner = participants.find(
    p =>
      (officialMatch && (isMale ? p.id === officialMatch.femaleId : p.id === officialMatch.maleId)) ||
      (partnerName && p.name.toLowerCase() === partnerName.toLowerCase())
  );

  // Reset or initialize conversation when partner/participant changes
  useEffect(() => {
    if (currentParticipant && partner && officialMatch) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: `Hai **${currentParticipant.name}**! 👋 Saya ialah **AI Dating Wingman** peribadi anda untuk sesi temu janji bersama **${partner.name}**.\n\n🔒 **Perlindungan Eksklusif:** Bimbingan AI ini dikunci khusus untuk interaksi anda bersama ${partner.name} (Skor Keserasian: **${officialMatch.score}%**).\n\nAnda boleh tanya apa sahaja soalan untuk menceriakan suasana, panduan topik bualan berkaitan minat beliau (${Array.isArray(partner.hobbies) ? partner.hobbies.join(', ') : partner.hobbies}), atau minta saya recap perjalanan dating anda pada bila-bila masa!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setRecapResult(null);

      // Default activities
      setActivities([
        {
          id: 'act-1',
          title: `Bicara Minat & Impian ${partner.name.split(' ')[0]}`,
          description: `Ketahui lebih mendalam tentang apa yang memotivasikan ${partner.name.split(' ')[0]} dalam kerjaya ${partner.occupation} dan minatnya.`,
          icebreaker: `"Apa projek atau impian peribadi yang paling membuatkan awak teruja tahun ini?"`,
          vibe: 'Mendalam & Bererti',
        },
        {
          id: 'act-2',
          title: 'Teka-Teki Pasangan & Destinasi Idaman',
          description: 'Bincangkan tempat percutian atau makanan kegemaran yang anda berdua idamkan.',
          icebreaker: `"Kalau ada tiket penerbangan percuma ke mana-mana esok, tempat mana yang awak paling teringin kita pergi?"`,
          vibe: 'Spontan & Mengujakan',
        },
        {
          id: 'act-3',
          title: 'Aktiviti Santai Bersama',
          description: `Rancang 15 minit untuk menikmati minuman atau snek kegemaran di ${partner.location || currentParticipant.location}.`,
          icebreaker: `"Jom kita pilihkan satu menu pencuci mulut rahsia untuk satu sama lain!"`,
          vibe: 'Santai & Manis',
        },
      ]);
      setCurrentCardIndex(0);
    }
  }, [currentParticipant?.id, partner?.id, officialMatch?.rank]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isLoading]);

  if (!isOpen) return null;

  // Send message to AI endpoint
  const handleSendMessage = async (textToSend?: string, customMode: 'chat' | 'recap' | 'activity_swipe' = 'chat') => {
    const text = textToSend || inputMessage;
    if (!text.trim() || !currentParticipant || !partner || !officialMatch || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/dating-companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant: currentParticipant,
          partner: partner,
          matchDossier: {
            score: officialMatch.score,
            whyTheyMatch: officialMatch.whyTheyMatch,
            potentialChallenges: officialMatch.potentialChallenges,
            recommendedActivities: officialMatch.recommendedActivities,
            crossCheckedTraits: officialMatch.crossCheckedTraits,
          },
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          mode: customMode,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal mendapatkan maklum balas AI');
      }

      const data = await response.json();
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Maaf, saya tidak dapat memproses jawapan pada saat ini.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (data.suggestedActivities && Array.isArray(data.suggestedActivities) && data.suggestedActivities.length > 0) {
        setActivities(data.suggestedActivities);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ Harap maaf, sambungan AI menghadapi sedikit kelewatan. Sila cuba hantar semula soalan anda.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Dating Recap
  const handleGenerateRecap = async () => {
    if (!currentParticipant || !partner || !officialMatch || isRecapping) return;
    setIsRecapping(true);

    const promptText = dateNotes.trim()
      ? `Berikut ialah nota dan pemerhatian saya semasa dating dengan ${partner.name}:\n"${dateNotes}"\n\nTolong sediakan analisis dan rumusan lengkap (Recap) perjalanan dating kami, termasuk green flags, keserasian bualan, dan tip langkah seterusnya.`
      : `Tolong sediakan rumusan (Recap) komprehensif bagi sesi dating saya bersama pasangan saya, ${partner.name}. Berikan penilaian keserasian, kekuatan bersama, dan cadangan langkah seterusnya.`;

    try {
      const response = await fetch('/api/ai/dating-companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant: currentParticipant,
          partner: partner,
          matchDossier: {
            score: officialMatch.score,
            whyTheyMatch: officialMatch.whyTheyMatch,
            potentialChallenges: officialMatch.potentialChallenges,
            recommendedActivities: officialMatch.recommendedActivities,
            crossCheckedTraits: officialMatch.crossCheckedTraits,
          },
          message: promptText,
          mode: 'recap',
        }),
      });

      if (!response.ok) throw new Error('Gagal menjana recap');
      const data = await response.json();
      setRecapResult(data.reply);
    } catch (err) {
      setRecapResult(
        `📝 **Rumusan Sesi Dating (${currentParticipant.name} & ${partner.name})**\n\n` +
          `✨ **Skor Keserasian Rasmi:** ${officialMatch.score}%\n` +
          `🟢 **Kekuatan:** Nilai hidup dan hobi yang saling melengkapi (${officialMatch.whyTheyMatch.slice(0, 140)}...)\n` +
          `🎯 **Cadangan:** Teruskan dengan aktiviti santai di kafe pilihan anda berdua!`
      );
    } finally {
      setIsRecapping(false);
    }
  };

  // Card reaction (swipe-like behavior)
  const handleReaction = (reaction: 'liked' | 'done' | 'skipped') => {
    const currentCard = activities[currentCardIndex];
    if (!currentCard) return;

    setActivityReactions(prev => ({ ...prev, [currentCard.id]: reaction }));

    if (reaction === 'liked' || reaction === 'done') {
      // Add notice into chat
      setMessages(prev => [
        ...prev,
        {
          id: `act-notice-${Date.now()}`,
          role: 'assistant',
          content: `💡 **Aktiviti Ditanda (${reaction === 'done' ? '✅ Selesai Dibuat' : '❤️ Disukai'}):** "${currentCard.title}"\n\n*Idea Icebreaker:* ${currentCard.icebreaker}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }

    if (currentCardIndex < activities.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const quickPrompts = [
    '💡 Beri 3 soalan icebreaker menarik',
    `☕ Apa topik santai sesuai untuk ${partner?.name.split(' ')[0] || 'beliau'}?`,
    '❤️ Cara tahu nilai hidup masa depannya',
    '🚩 Apa topik sensitif yang patut dielakkan?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-inverse-surface/60 backdrop-blur-xs">
      <div className="bg-surface-container-lowest w-full max-w-4xl h-[92vh] sm:h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200">
        
        {/* TOP BAR / HEADER */}
        <div className="bg-gradient-to-r from-primary to-secondary p-4 sm:p-5 text-on-primary flex flex-col gap-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <span className="material-symbols-outlined text-2xl text-pink-200">favorite</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-sm font-serif text-white font-bold text-lg sm:text-xl tracking-tight">
                    Jodoh AI Dating Wingman
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Masa Nyata
                  </span>
                </div>
                <p className="text-white/80 text-xs sm:text-sm font-sans">
                  Pembantu Peribadi & Pemandu Temu Janji Semasa Sesi Dating
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
              title="Tutup dialog"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* ATTENDEE & STRICT PARTNER IDENTITY STATUS BANNER */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              {/* Participant selector for Admin or identity switch */}
              {isAdmin && participants.length > 1 ? (
                <div className="flex items-center gap-2">
                  <span className="text-white/70 font-medium">Peserta:</span>
                  <select
                    value={selectedParticipantId}
                    onChange={e => setSelectedParticipantId(e.target.value)}
                    className="bg-white text-primary font-bold text-xs py-1 px-2.5 rounded-lg border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 cursor-pointer"
                  >
                    {participants.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.gender})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white">
                  <span className="material-symbols-outlined text-base text-pink-200">person</span>
                  <span className="font-semibold">{currentParticipant?.name || 'Peserta'}</span>
                </div>
              )}

              <span className="text-pink-200 font-bold">⇄</span>

              {partner ? (
                <div className="flex items-center gap-2 text-white bg-white/15 px-3 py-1 rounded-xl border border-white/20">
                  <span className="material-symbols-outlined text-base text-pink-300">partner_exchange</span>
                  <span className="font-bold">{partner.name}</span>
                  <span className="bg-secondary-container text-on-secondary-container font-extrabold text-[10px] px-1.5 py-0.5 rounded-md">
                    {officialMatch?.score}% Serasi
                  </span>
                </div>
              ) : (
                <span className="text-amber-200 italic font-medium">Belum Dipadankan</span>
              )}
            </div>

            {/* STRICT ENFORCEMENT NOTICE */}
            <div className="flex items-center gap-1.5 text-[11px] text-pink-100 font-medium bg-black/20 px-2.5 py-1 rounded-lg">
              <span className="material-symbols-outlined text-sm text-pink-300">lock</span>
              <span>Eksklusif: AI Wingman dikunci hanya untuk pasangan padanan rasmi ini</span>
            </div>
          </div>
        </div>

        {/* IF UNPAIRED WARNING */}
        {!officialMatch || !partner ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">hourglass_empty</span>
            </div>
            <h3 className="font-serif font-bold text-xl text-on-surface mb-2">
              Pasangan Padanan Belum Tersedia
            </h3>
            <p className="text-on-surface-variant max-w-md text-sm leading-relaxed mb-6">
              AI Dating Wingman hanya boleh diakses selepas penganjur menjana keputusan pemadanan AI rasmi. Setiap peserta hanya boleh berinteraksi dengan AI mengenai pasangan eksklusif mereka.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-container transition-all cursor-pointer shadow-sm"
            >
              Kembali ke Menu Utama
            </button>
          </div>
        ) : (
          <>
            {/* NAVIGATION TABS */}
            <div className="bg-surface-container-low px-4 pt-3 border-b border-outline-variant/20 flex gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  activeTab === 'chat'
                    ? 'bg-surface-container-lowest text-primary border-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-base">chat</span>
                <span>Sembang AI Masa Nyata</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('recap')}
                className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  activeTab === 'recap'
                    ? 'bg-surface-container-lowest text-primary border-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-base">history_edu</span>
                <span>Recap Perjalanan Dating</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('activities')}
                className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  activeTab === 'activities'
                    ? 'bg-surface-container-lowest text-primary border-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-base">style</span>
                <span>Kad Aktiviti & Swipe</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. CHAT VIEW */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden bg-surface">
                {/* Messages scroll area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[88%] sm:max-w-[78%] ${
                        msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                          msg.role === 'user'
                            ? 'bg-primary text-on-primary'
                            : 'bg-gradient-to-tr from-pink-600 to-rose-400 text-white'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          currentParticipant?.name?.[0] || 'U'
                        ) : (
                          <span className="material-symbols-outlined text-base">smart_toy</span>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <div
                          className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-line ${
                            msg.role === 'user'
                              ? 'bg-primary text-on-primary rounded-tr-xs'
                              : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded-tl-xs'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-outline mt-1 px-1">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 mr-auto items-center text-xs text-on-surface-variant bg-surface-container-lowest px-4 py-3 rounded-2xl border border-outline-variant/30 shadow-xs">
                      <span className="material-symbols-outlined text-base text-primary animate-spin">
                        progress_activity
                      </span>
                      <span>AI Dating Wingman sedang menganalisis & menaip jawapan...</span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Quick Prompts Carousel */}
                <div className="px-4 py-2 bg-surface-container-lowest border-t border-outline-variant/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span className="text-[11px] font-bold text-outline shrink-0 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    Idea Pantas:
                  </span>
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isLoading}
                      className="shrink-0 text-xs bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface py-1.5 px-3 rounded-full border border-outline-variant/30 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <div className="p-3 sm:p-4 bg-surface-container-lowest border-t border-outline-variant/20">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      placeholder={`Tanya apa sahaja mengenai ${partner.name} atau tip dating...`}
                      disabled={isLoading}
                      className="flex-1 bg-surface-container-high/60 focus:bg-white text-on-surface text-xs sm:text-sm px-4 py-3 rounded-2xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                    />

                    <button
                      type="submit"
                      disabled={isLoading || !inputMessage.trim()}
                      className="h-11 px-5 rounded-2xl bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      <span>Hantar</span>
                      <span className="material-symbols-outlined text-base">send</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. DATING RECAP VIEW */}
            {activeTab === 'recap' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface flex flex-col gap-6">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200/60 rounded-3xl p-5 shadow-xs">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">insights</span>
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-primary">
                        Recap & Refleksi Perjalanan Dating Bersama {partner.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        Catatkan tanggapan anda atau minta Gemini AI menjana rumusan sentimen dan panduan seterusnya.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Nota / Tanggapan Anda Semasa Sesi Dating (Pilihan):
                    </label>
                    <textarea
                      value={dateNotes}
                      onChange={e => setDateNotes(e.target.value)}
                      rows={3}
                      placeholder={`Contoh: Kami berbual tentang hobi ${partner.name.split(' ')[0]} dalam ${Array.isArray(partner.hobbies) ? partner.hobbies[0] : 'minatnya'}. Beliau nampak ceria dan suka mendengar, cuma ada sedikit kekok masa mula-mula...`}
                      className="w-full bg-white text-on-surface text-xs sm:text-sm p-3.5 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleGenerateRecap}
                        disabled={isRecapping}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isRecapping ? (
                          <>
                            <span className="material-symbols-outlined text-base animate-spin">
                              progress_activity
                            </span>
                            <span>Sedang Menjana Rumusan AI...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-base">auto_awesome</span>
                            <span>Jana Rumusan & Sentimen AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recap Output Display */}
                {recapResult ? (
                  <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-md">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <span className="material-symbols-outlined">verified</span>
                        <span>Rumusan Rasmi Sesi Temu Janji</span>
                      </div>
                      <span className="text-xs text-outline font-medium">Dikuasakan oleh Gemini AI</span>
                    </div>

                    <div className="text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-line space-y-3 font-sans">
                      {recapResult}
                    </div>

                    <div className="mt-6 pt-4 border-t border-outline-variant/20 flex flex-wrap gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(recapResult);
                          alert('Rumusan berjaya disalin ke papan keratan (clipboard)!');
                        }}
                        className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">content_copy</span>
                        <span>Salin Rumusan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('chat');
                          handleSendMessage('Berdasarkan recap ini, apa cadangan tarikh dan masa terbaik untuk saya ajak beliau date kali kedua?');
                        }}
                        className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-base">forward</span>
                        <span>Tanya Tip Lanjutan dalam Chat</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-on-surface-variant text-xs sm:text-sm">
                    Tekan butang <strong className="text-primary">"Jana Rumusan & Sentimen AI"</strong> di atas untuk melihat ulasan mendalam tentang perjalanan temu janji anda bersama {partner.name}.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 3. INTERACTIVE SWIPE ACTIVITIES */}
            {activeTab === 'activities' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface flex flex-col items-center justify-center">
                {activities.length > 0 && currentCardIndex < activities.length ? (
                  <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 sm:p-7 border border-outline-variant/30 shadow-xl flex flex-col gap-4 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-[11px] font-extrabold uppercase tracking-wider">
                        {activities[currentCardIndex].vibe}
                      </span>
                      <span className="text-xs text-outline font-bold">
                        Kad {currentCardIndex + 1} daripada {activities.length}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-xl text-primary mb-2">
                        {activities[currentCardIndex].title}
                      </h3>
                      <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                        {activities[currentCardIndex].description}
                      </p>
                    </div>

                    {/* Icebreaker Callout */}
                    <div className="bg-surface-container-high/60 p-4 rounded-2xl border border-outline-variant/20">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-1">
                        <span className="material-symbols-outlined text-base text-rose-500">forum</span>
                        <span>Soalan Spontan Untuk Ditanya:</span>
                      </div>
                      <p className="text-xs sm:text-sm italic font-medium text-on-surface">
                        {activities[currentCardIndex].icebreaker}
                      </p>
                    </div>

                    {/* Reaction Buttons */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleReaction('skipped')}
                        className="flex-1 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-base">skip_next</span>
                        <span>Langkau</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReaction('liked')}
                        className="flex-1 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-rose-200 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-base">favorite</span>
                        <span>Suka / Simpan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReaction('done')}
                        className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        <span>Dah Buat!</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 max-w-sm bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-md">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-3xl">celebration</span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-on-surface mb-1">
                      Hebat! Semua Kad Telah Diterokai
                    </h3>
                    <p className="text-xs text-on-surface-variant mb-5">
                      Anda telah menyemak semua aktiviti cadangan bersama {partner.name}. Anda boleh kembali ke sembang untuk bertanyakan apa-apa soalan lain!
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => setCurrentCardIndex(0)}
                        className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-bold text-xs cursor-pointer hover:bg-surface-container-high transition-all"
                      >
                        Ulang Semula Kad
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('chat')}
                        className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs cursor-pointer hover:bg-primary-container transition-all"
                      >
                        Ke Ruang Sembang
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
