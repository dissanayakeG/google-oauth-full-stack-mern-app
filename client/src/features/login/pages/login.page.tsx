import googleLogo from '/assets/google-logo.png';
export default function LoginPage() {
  const handleLogin = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL;

    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="mx-auto w-xs sm:w-md h-screen flex flex-col justify-center items-center">
      <div className="w-full border p-8 rounded-lg shadow-lg text-center text-sm sm:text-base">
        <h2 className="text-2xl mb-4">Login to your account</h2>
        <button
          onClick={handleLogin}
          className="flex space-y-1 text-xs w-48 sm:w-64 mx-auto h-12 border p-2"
        >
          <img src={googleLogo} alt="Google Logo" className="my-auto w-6" />
          <span className="mx-auto my-auto font-semibold">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
}
