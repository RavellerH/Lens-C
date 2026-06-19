import { Link } from 'react-router-dom';
import './OnboardingBanner.css';

export function OnboardingBanner() {
  return (
    <div className="onboarding-banner">
      <div className="onboarding-banner__text">
        <strong>Make this personal in 30 seconds.</strong>
        <span>Import your Letterboxd history (or connect Trakt) for taste-matched picks.</span>
      </div>
      <Link to="/settings" className="onboarding-banner__cta">
        Personalize now
      </Link>
    </div>
  );
}
