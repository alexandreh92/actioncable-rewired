import { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import { foo } from 'actioncable-rewired';

function App() {
  return <div>{foo}</div>;
}

export default App;
