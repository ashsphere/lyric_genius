import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { GeneratePage } from '@/pages/GeneratePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { LyricsDetailPage } from '@/pages/LyricsDetailPage';
import { RuleSettingPage } from '@/pages/RuleSettingPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PersonaManagePage } from '@/pages/PersonaManagePage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<GeneratePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/lyrics/:id" element={<LyricsDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/rule" element={<RuleSettingPage />} />
        <Route path="/settings/personas" element={<PersonaManagePage />} />
      </Routes>
    </Layout>
  );
}
