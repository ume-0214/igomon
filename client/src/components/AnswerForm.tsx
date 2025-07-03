// client/src/components/AnswerForm.tsx
import React, { useEffect, useState } from 'react';

interface AnswerFormProps {
  selectedCoordinate: string;
  onSubmit: (data: {
    coordinate: string;
    reason: string;
    playerName: string;
    playerRank: string;
  }) => void;
}

export function AnswerForm({ selectedCoordinate, onSubmit }: AnswerFormProps) {
  const [reason, setReason] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerRank, setPlayerRank] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // LocalStorageから名前と段位を復元
  useEffect(() => {
    const savedName = localStorage.getItem('igomon_user_name') || '';
    const savedRank = localStorage.getItem('igomon_user_rank') || '';
    setPlayerName(savedName);
    setPlayerRank(savedRank);
  }, []);

  // SGF座標を標準囲碁記法に変換
  const sgfToDisplayCoordinate = (sgfCoord: string): string => {
    if (!sgfCoord || sgfCoord.length !== 2) return '';
    
    const x = sgfCoord.charCodeAt(0) - 'a'.charCodeAt(0);
    const y = sgfCoord.charCodeAt(1) - 'a'.charCodeAt(0);
    
    const letters = 'ABCDEFGHJKLMNOPQRST'; // I除く
    const letter = letters[x];
    const number = 19 - y;
    
    return `${letter}${number}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const newErrors: Record<string, string> = {};
    
    if (!selectedCoordinate) {
      newErrors.coordinate = '着手点を選択してください';
    }
    if (!reason.trim()) {
      newErrors.reason = '着手の理由を入力してください';
    }
    if (!playerName.trim()) {
      newErrors.playerName = '名前を入力してください';
    }
    if (!playerRank.trim()) {
      newErrors.playerRank = '段位を入力してください';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // LocalStorageに保存
    localStorage.setItem('igomon_user_name', playerName);
    localStorage.setItem('igomon_user_rank', playerRank);
    
    // 送信
    onSubmit({
      coordinate: selectedCoordinate,
      reason: reason.trim(),
      playerName: playerName.trim(),
      playerRank: playerRank.trim()
    });
  };

  return (
    <div>
      <form className="answer-form" onSubmit={handleSubmit}>
        <div className="name-rank-row">
          <div className="form-group-inline">
            <label htmlFor="playerName">名前 <span className="required">*</span></label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className={errors.playerName ? 'error' : ''}
            />
            {errors.playerName && <span className="error-message">{errors.playerName}</span>}
          </div>
          
          <div className="form-group-inline">
            <label htmlFor="playerRank">段位 <span className="required">*</span></label>
          <select
            id="playerRank"
            value={playerRank}
            onChange={(e) => setPlayerRank(e.target.value)}
            className={errors.playerRank ? 'error' : ''}
        >
          <option value="">段位を選択</option>
          <option value="20級">20級</option>
          <option value="19級">19級</option>
          <option value="18級">18級</option>
          <option value="17級">17級</option>
          <option value="16級">16級</option>
          <option value="15級">15級</option>
          <option value="14級">14級</option>
          <option value="13級">13級</option>
          <option value="12級">12級</option>
          <option value="11級">11級</option>
          <option value="10級">10級</option>
          <option value="9級">9級</option>
          <option value="8級">8級</option>
          <option value="7級">7級</option>
          <option value="6級">6級</option>
          <option value="5級">5級</option>
          <option value="4級">4級</option>
          <option value="3級">3級</option>
          <option value="2級">2級</option>
          <option value="1級">1級</option>
          <option value="初段">初段</option>
          <option value="二段">二段</option>
          <option value="三段">三段</option>
          <option value="四段">四段</option>
          <option value="五段">五段</option>
          <option value="六段">六段</option>
          <option value="七段">七段</option>
          <option value="八段">八段</option>
          <option value="九段">九段</option>
          </select>
            {errors.playerRank && <span className="error-message">{errors.playerRank}</span>}
          </div>
        </div>
        
        <div className="form-group coordinate-display">
          <label>選択座標</label>
          <div className="coordinate-value">
            {selectedCoordinate ? sgfToDisplayCoordinate(selectedCoordinate) : '盤面をクリックして選択'}
          </div>
          {errors.coordinate && <span className="error-message">{errors.coordinate}</span>}
        </div>
        
        <div className="form-group-vertical">
          <label htmlFor="reason">着手の理由 <span className="required">*</span></label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="なぜこの手を選んだのか、理由を記入してください"
            rows={4}
            className={errors.reason ? 'error' : ''}
          />
          {errors.reason && <span className="error-message">{errors.reason}</span>}
        </div>
      
      <button type="submit" className="submit-button">
        SUBMIT
      </button>
    </form>
    </div>
  );
}