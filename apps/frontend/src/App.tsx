import { Link, Route, Routes } from 'react-router-dom';

function Home() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-4">LyricGenius</h1>
      <p className="text-gray-600 mb-6">歌詞生成ツールの初期セットアップ完了</p>
      <div className="space-x-4">
        <Link className="px-3 py-2 rounded bg-brand-600 text-white" to="/history">履歴</Link>
        <Link className="px-3 py-2 rounded border" to="/settings">設定</Link>
      </div>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return <div className="p-6">{title} 準備中...</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/history" element={<Placeholder title="履歴" />} />
      <Route path="/settings" element={<Placeholder title="設定" />} />
    </Routes>
  );
}

