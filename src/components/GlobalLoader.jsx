import "../styles/global-loader.css";
import BrandLogo from "../assets/brand logo.svg";

function GlobalLoader() {
  return (
    <div className="global-loader">
      <div className="loader-brand">
        <img src={BrandLogo} alt="CodeGram logo" className="loader-logo" />

        <h1 className="loader-title brand-gradient">
          CodeGram
        </h1>
      </div>

      <div className="loader-spinner"></div>

      <div className="loader-text">
        Preparing your space…
      </div>
    </div>
  );
}

export default GlobalLoader;
