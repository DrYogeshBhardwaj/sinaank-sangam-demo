import React, { Suspense } from 'react';

const SceneManager = React.lazy(() => import('./solar3d/SceneManager.jsx'));

export default function SolarView3D(props) {
  return (
    <div className="solar-observatory-engine" style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={<div className="loader glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Loading 3D Engine...</div>}>
        <SceneManager {...props} />
      </Suspense>
    </div>
  );
}
