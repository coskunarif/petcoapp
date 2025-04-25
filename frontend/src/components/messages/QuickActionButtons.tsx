import React from 'react';

const QuickActionButtons = () => {
  // TODO: Populate with real quick actions (e.g., share pet info, schedule reminder)
  const actions = [
    { label: 'Thanks!', onClick: () => alert('Quick Action: Thanks!') },
    { label: 'On my way', onClick: () => alert('Quick Action: On my way') },
    { label: 'Share Pet Card', onClick: () => alert('Quick Action: Share Pet Card') },
  ];
  return (
    <div>
      {actions.map((a, i) => (
        <button key={i} type="button" onClick={a.onClick}>{a.label}</button>
      ))}
    </div>
  );
};

export default QuickActionButtons;
