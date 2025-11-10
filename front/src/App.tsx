import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import MainLayout from "./layouts/MainLayout";
import QuranLayout from "./layouts/QuranLayout";
import LoadingScreen from "./components/LoadingScreen";
import QuranList from "./pages/QuranList";

const HomePage = lazy(() => import("./pages/index"));
const QuranModernPage = lazy(() => import("./pages/quran/Modern"));
const QuranClassicPage = lazy(() => import("./pages/quran/Classic"));
const AdhkarPage = lazy(() => import("./pages/adhkar"));
const SelfLearnPage = lazy(() => import("./pages/self-learn"));
const HalaqatPage = lazy(() => import("./pages/halaqat"));
const HadithPage = lazy(() => import("./pages/hadith"));
const DawahPage = lazy(() => import("./pages/dawah"));
const AskScholarsPage = lazy(() => import("./pages/ask-scholars"));
const IslamicLearningPage = lazy(() => import("./pages/islamic-learning"));
const SeerahPage = lazy(() => import("./pages/seerah"));
const SettingsPage = lazy(() => import("./pages/settings"));
const DashboardIndex = lazy(() => import("./pages/dashboard"));
const DashboardContent = lazy(() => import("./pages/dashboard/content"));
const DashboardQuran = lazy(() => import("./pages/dashboard/quran"));
const DashboardHalaqat = lazy(() => import("./pages/dashboard/halaqat"));
const DashboardAdhkar = lazy(() => import("./pages/dashboard/adhkar"));
const DashboardHadith = lazy(() => import("./pages/dashboard/hadith"));
const DashboardUsers = lazy(() => import("./pages/dashboard/users"));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/adhkar" element={<AdhkarPage />} />
          <Route path="/self-learn" element={<SelfLearnPage />} />
          <Route path="/halaqat" element={<HalaqatPage />} />
          <Route path="/hadith" element={<HadithPage />} />
          <Route path="/dawah" element={<DawahPage />} />
          <Route path="/ask-scholars" element={<AskScholarsPage />} />
          <Route path="/islamic-learning" element={<IslamicLearningPage />} />
          <Route path="/seerah" element={<SeerahPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="/quran" element={<QuranLayout />}>
          <Route index element={<QuranList />} />
          <Route path="modern" element={<QuranModernPage />} />
          <Route path="classic" element={<QuranClassicPage />} />
        </Route>
        <Route path="/dashboard" element={<DashboardIndex />} />
        <Route path="/dashboard/content" element={<DashboardContent />} />
        <Route path="/dashboard/quran" element={<DashboardQuran />} />
        <Route path="/dashboard/halaqat" element={<DashboardHalaqat />} />
        <Route path="/dashboard/adhkar" element={<DashboardAdhkar />} />
        <Route path="/dashboard/hadith" element={<DashboardHadith />} />
        <Route path="/dashboard/users" element={<DashboardUsers />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}

export default App;
