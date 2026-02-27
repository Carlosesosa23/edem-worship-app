import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SongsProvider } from './contexts/SongsContext';
import { MixesProvider } from './contexts/MixesContext';
import { LiveSessionProvider } from './contexts/LiveSessionContext';
import { AgendaProvider } from './contexts/AgendaContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { SongList } from './pages/SongList';
import { SongViewer } from './pages/SongViewer';
import { SongEditor } from './pages/SongEditor';
import { MixList } from './pages/MixList';
import { MixEditor } from './pages/MixEditor';
import { MixViewer } from './pages/MixViewer';
import { AgendaList } from './pages/AgendaList';
import { AgendaEditor } from './pages/AgendaEditor';
import { AgendaViewer } from './pages/AgendaViewer';

function App() {
  return (
    <SongsProvider>
      <MixesProvider>
        <LiveSessionProvider>
          <AgendaProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="songs" element={<SongList />} />
                  <Route path="mixes" element={<MixList />} />
                  <Route path="agenda" element={<AgendaList />} />
                </Route>

                {/* Routes without Layout (fullscreen) */}
                <Route path="/songs/:id" element={<SongViewer />} />
                <Route path="/songs/add" element={<SongEditor />} />
                <Route path="/edit/:id" element={<SongEditor />} />
                <Route path="/mixes/add" element={<MixEditor />} />
                <Route path="/mixes/:id" element={<MixViewer />} />
                <Route path="/agenda/add" element={<AgendaEditor />} />
                <Route path="/agenda/edit/:id" element={<AgendaEditor />} />
                <Route path="/agenda/:id" element={<AgendaViewer />} />
              </Routes>
            </BrowserRouter>
          </AgendaProvider>
        </LiveSessionProvider>
      </MixesProvider>
    </SongsProvider>
  );
}

export default App;
