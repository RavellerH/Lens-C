import { Link } from 'react-router-dom';
import './OnboardingBanner.css';

export function OnboardingBanner() {
  return (
    <div className="onboarding-banner">
      <div className="onboarding-banner__text">
        <strong>Make this personal in 30 seconds.</strong>
        <span>Add a free TMDb key for richer discovery, then connect Letterboxd or Trakt for taste-matched picks.</span>
      </div>
      <Link to="/settings" className="onboarding-banner__cta">
        Personalize now
      </Link>
    </div>
  );
}
