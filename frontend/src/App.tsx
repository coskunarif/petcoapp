import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PetsScreen from './screens/PetsScreen';

const App: React.FC = () => (
  <Provider store={store}>
    <Router>
      <Routes>
        <Route path="/pets" element={<PetsScreen />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<Navigate to="/pets" replace />} />
      </Routes>
    </Router>
  </Provider>
);

export default App;
