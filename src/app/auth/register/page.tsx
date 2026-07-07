// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function RegisterPage() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("STUDENT"); // Default role matching your schema enum
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const res = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, email, password, role }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Something went wrong");
//       }

//       // Successful registration -> send them to the login page
//       router.push("/auth/login");
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
//       <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-md">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
//             Create your CampusEats account
//           </h2>
//         </div>
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {error && (
//             <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
//               {error}
//             </div>
//           )}
//           <div className="space-y-4 rounded-md shadow-sm">
//             <div>
//               <label className="text-sm font-medium text-gray-700">Full Name</label>
//               <input
//                 type="text"
//                 required
//                 className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
//                 placeholder="John Doe"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700">Email address</label>
//               <input
//                 type="email"
//                 required
//                 className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
//                 placeholder="student@campus.edu"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700">Password</label>
//               <input
//                 type="password"
//                 required
//                 className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700">I am a:</label>
//               <select
//                 className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//               >
//                 <option value="STUDENT">Student / Customer</option>
//                 <option value="CANTEEN_ADMIN">Canteen Staff / Admin</option>
//               </select>
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative flex w-full justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400"
//             >
//               {loading ? "Registering..." : "Sign up"}
//             </button>
//           </div>
//         </form>
//         <div className="text-center text-sm text-gray-600">
//           Already have an account?{" "}
//           <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
//             Sign in here
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }



// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function RegisterPage() {
//   // --- STATE DECLARATIONS (EXACT CODE MATCH FROM TEMPLATE) ---
//   const [role, setRole] = useState('student'); // 'student' or 'faculty' matching UI actions
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [facultyCode, setFacultyCode] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [otp, setOtp] = useState('');
//   const [confirmationResult, setConfirmationResult] = useState<any>(null);
//   const [error, setError] = useState('');
//   const [showRoleSelection, setShowRoleSelection] = useState(true);
//   const [showEmailSignup, setShowEmailSignup] = useState(true);
//   const [usernameStatus, setUsernameStatus] = useState('');
//   const [usernameValid, setUsernameValid] = useState(false);
//   const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  
//   // Custom tracking state for API interaction
//   const [name, setName] = useState(''); 
//   const router = useRouter();

//   const facultySecretCode = "BMSFACULTY2025";

//   // --- INTERACTIVE SYSTEM FUNCTIONS (EXACT MATCH FORM LOGIC) ---
//   const handleRoleSelection = () => {
//     setShowRoleSelection(false);
//   };

//   const handleCreateUsername = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setUsernameStatus('');
//     setUsernameCheckLoading(true);

//     const hasUpperCase = /[A-Z]/.test(username);
//     const hasLowerCase = /[a-z]/.test(username);
//     const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(username);
//     const hasNumber = /[0-9]/.test(username);

//     if (!hasUpperCase || !hasLowerCase || !hasSymbol || !hasNumber || username.length < 8) {
//       setUsernameStatus('Username must include at least one small letter, one capital letter, one symbol, and one number and length should be minimum 8.');
//       setUsernameCheckLoading(false);
//       return;
//     }

//     // Client-side visual verification simulation for 10-day workspace constraints
//     setTimeout(() => {
//       setUsernameStatus('Username is available!');
//       setUsernameValid(true);
//       setUsernameCheckLoading(false);
//     }, 600);
//   };

//   const handleEmailSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (!usernameValid) {
//       setError('Please create a valid username first.');
//       return;
//     }
//     if (password !== confirmPassword) {
//       setError('Passwords do not match.');
//       return;
//     }
//     if (role === 'faculty' && facultyCode !== facultySecretCode) {
//       setError('Incorrect faculty code.');
//       return;
//     }

//     try {
//       // Map 'student' or 'faculty' selection seamlessly to Prisma DB Model Roles
//       const prismaMappedRole = role === 'faculty' ? 'CANTEEN_ADMIN' : 'STUDENT';
      
//       // Fallback display name logic if separate field is omitted
//       const finalDisplayName = name || username;

//       const res = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           name: finalDisplayName, 
//           email, 
//           password, 
//           role: prismaMappedRole 
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to create an account. Please try again.");
//       }

//       // Success -> Redirect cleanly to login page view route
//       router.push("/auth/login");
//     } catch (err: any) {
//       setError(err.message);
//     }
//   };

//   const handleGoogleSignup = async () => {
//     setError('');
//     if (!usernameValid) {
//       setError('Please create a valid username first.');
//       return;
//     }
//     setError('Google provider auth is not configured in local environment stack.');
//   };

//   const handlePhoneSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     if (!usernameValid) {
//       setError('Please create a valid username first.');
//       return;
//     }
//     // Simulate setup verification transition
//     setConfirmationResult(true);
//   };

//   const verifyOtp = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setError('SMS Gateway is running in offline local sandbox configuration mode.');
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden p-4 sm:p-8">
      
//       {/* Food Pattern Background Layer */}
//       <div 
//         className="absolute inset-0 opacity-10 pointer-events-none"
//         style={{
//           backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Cg fill='none' stroke='%23000' stroke-width='2'%3E%3Ccircle cx='100' cy='100' r='40'/%3E%3Cpath d='M80 90h40v20H80z'/%3E%3Ccircle cx='200' cy='150' r='25'/%3E%3Cpath d='M190 140c0-10 5-15 10-15s10 5 10 15-5 15-10 15-10-5-10-15z'/%3E%3Crect x='300' y='80' width='60' height='40' rx='5'/%3E%3Ccircle cx='400' cy='200' r='30'/%3E%3Cpath d='M380 180h40v40H380z'/%3E%3Ccircle cx='150' cy='250' r='20'/%3E%3Cpath d='M130 240h40v20H130z'/%3E%3Ccircle cx='500' cy='120' r='35'/%3E%3Cpath d='M480 100h40v40H480z'/%3E%3Ccircle cx='350' cy='300' r='25'/%3E%3Cpath d='M330 285h40v30H330z'/%3E%3C/g%3E%3C/svg%3E")`,
//           backgroundSize: '400px 300px',
//           backgroundRepeat: 'repeat'
//         }}
//       ></div>

//       {/* Floating Food Elements Animations */}
//       <div className="absolute top-10 left-10 w-8 h-8 bg-white bg-opacity-20 rounded-full animate-bounce"></div>
//       <div className="absolute top-20 right-20 w-6 h-6 bg-white bg-opacity-15 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//       <div className="absolute bottom-20 left-20 w-10 h-10 bg-white bg-opacity-10 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//       <div className="absolute bottom-10 right-10 w-7 h-7 bg-white bg-opacity-20 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>

//       {/* Main Glassmorphism Presentation Container Panel */}
//       <div className="bg-white bg-opacity-95 backdrop-blur-lg p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md border border-white border-opacity-20 relative z-10">
        
//         {/* College Header Branding Layout Block */}
//         <div className="text-center mb-6 sm:mb-8">
//           <h1 className="text-lg sm:text-xl font-bold text-blue-700 mb-1 leading-tight">
//             B.M.S. College of Engineering
//           </h1>
//           <p className="text-xs sm:text-sm text-gray-600 mb-4">Established 1946 • Bangalore</p>
//           <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">Create an Account</h2>
//           <p className="text-sm text-gray-600">Join Campus Eats today</p>
//         </div>

//         {error && (
//           <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
//             <p className="text-red-600 text-center text-sm font-medium">{error}</p>
//           </div>
//         )}

//         {/* SECTION STAGE 1: Progressive Role Selector Wizard */}
//         {showRoleSelection && (
//           <>
//             <div className="mb-6 space-y-4">
//               <label className="block text-gray-700 font-medium mb-2">I am a:</label>
//               <div className="flex space-x-4">
//                 <button
//                   type="button"
//                   onClick={() => setRole('student')}
//                   className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${role === 'student' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//                 >
//                   Student
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setRole('faculty')}
//                   className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${role === 'faculty' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//                 >
//                   Faculty
//                 </button>
//               </div>
//             </div>
//             <button
//               onClick={handleRoleSelection}
//               className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:scale-105"
//             >
//               Continue
//             </button>
//           </>
//         )}

//         {/* SECTION STAGE 2: Secondary Account Setup Workflow Wizard */}
//         {!showRoleSelection && !confirmationResult && (
//           <>
//             <div className="my-6 text-center text-gray-400 font-medium">— CREATE USERNAME —</div>
//             <div className="space-y-2">
//               <label className="block text-gray-700 font-medium mb-1 text-sm">Username</label>
//               <div className="flex items-center">
//                 <input
//                   type="text"
//                   value={username}
//                   onChange={(e) => {
//                     setUsername(e.target.value);
//                     setUsernameValid(false);
//                   }}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 text-sm"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={handleCreateUsername}
//                   className="ml-2 bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:bg-blue-600 text-sm"
//                   disabled={usernameCheckLoading}
//                 >
//                   {usernameCheckLoading ? 'Checking...' : 'Check'}
//                 </button>
//               </div>
//               {usernameStatus && (
//                 <p className={`text-sm ${usernameValid ? 'text-green-600' : 'text-red-600'}`}>
//                   {usernameStatus}
//                 </p>
//               )}
//               {!usernameValid && (
//                 <p className="text-xs text-gray-500 mt-1">
//                   Username must contain a small letter, a capital letter, a number, and a symbol and length should be min 8.
//                 </p>
//               )}
//             </div>

//             <div className="my-6 text-center text-gray-400 font-medium">— REGISTER —</div>

//             <div className="mb-4">
//               <button
//                 type="button"
//                 onClick={handleGoogleSignup}
//                 disabled={!usernameValid}
//                 className={`w-full flex items-center justify-center py-3 rounded-xl border border-gray-300 transition-all duration-300 ${!usernameValid ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
//               >
//                 <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 7.917-11.303 7.917-6.906 0-12.5-5.594-12.5-12.5s5.594-12.5 12.5-12.5c3.385 0 6.45 1.455 8.653 3.593l6.386-6.386C35.53 4.22 29.354 1 24 1 12.35 1 2.5 10.85 2.5 22.5s9.85 21.5 21.5 21.5c10.595 0 19.467-7.79 21.116-18.167h-2.116z" fill="#4285F4" />
//                   <path d="M2.5 22.5c0 1.954.336 3.827.943 5.568l5.885-4.593c-.34-.992-.528-2.046-.528-3.075s.188-2.083.528-3.075l-5.885-4.593A19.98 19.98 0 002.5 22.5z" fill="#FBBC05" />
//                   <path d="M24 10c3.172 0 6.079 1.109 8.358 2.923l5.654-5.654C34.04 4.14 29.362 1 24 1 12.35 1 2.5 10.85 2.5 22.5c0 1.954.336 3.827.943 5.568L14.328 20c-.57-1.393-.896-2.946-.896-4.526 0-3.385 1.455-6.45 3.593-8.653L24 10z" fill="#EA4335" />
//                   <path d="M43.611 20.083c0-1.282-.117-2.54-.316-3.766H24v8h11.303c-1.649 4.657-6.08 7.917-11.303 7.917-6.906 0-12.5-5.594-12.5-12.5 0-6.906 5.594-12.5 12.5-12.5 3.385 0 6.45 1.455 8.653 3.593l6.386-6.386C35.53 4.22 29.354 1 24 1 12.35 1 2.5 10.85 2.5 22.5s9.85 21.5 21.5 21.5c10.595 0 19.467-7.79 21.116-18.167h-2.116z" fill="#34A853" />
//                 </svg>
//                 <span className="text-sm">Sign in with Google</span>
//               </button>
//             </div>

//             <div className="my-6 text-center text-gray-400 font-medium">— OR —</div>

//             {/* Credential Modality Option Toggle Bars */}
//             <div className="flex space-x-2 mb-4">
//               <button
//                 type="button"
//                 onClick={() => setShowEmailSignup(true)}
//                 className={`flex-1 py-2 rounded-xl font-medium transition-all duration-300 text-sm ${showEmailSignup ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
//               >
//                 Email
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowEmailSignup(false)}
//                 className={`flex-1 py-2 rounded-xl font-medium transition-all duration-300 text-sm ${!showEmailSignup ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
//               >
//                 Phone
//               </button>
//             </div>
            
//             {showEmailSignup ? (
//               <form onSubmit={handleEmailSignup} className="space-y-4">
//                 <div>
//                   <label className="block text-gray-700 font-medium mb-1 text-sm">Full Name</label>
//                   <input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 text-sm"
//                     placeholder="John Doe"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-gray-700 font-medium mb-1 text-sm">Email</label>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 text-sm"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-gray-700 font-medium mb-1 text-sm">Create Password</label>
//                   <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 text-sm"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-gray-700 font-medium mb-1 text-sm">Confirm Password</label>
//                   <input
//                     type="password"
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 text-sm"
//                     required
//                   />
//                 </div>
//                 {role === 'faculty' && (
//                   <div>
//                     <label className="block text-gray-700 font-medium mb-1 text-sm">Faculty Code</label>
//                     <input
//                       type="text"
//                       value={facultyCode}
//                       onChange={(e) => setFacultyCode(e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 text-sm"
//                       required
//                     />
//                   </div>
//                 )}
//                 <button
//                   type="submit"
//                   disabled={!usernameValid}
//                   className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 text-sm ${!usernameValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-105'}`}
//                 >
//                   Create Account
//                 </button>
//               </form>
//             ) : (
//               <form onSubmit={handlePhoneSignup} className="space-y-4">
//                 <div>
//                   <label className="block text-gray-700 font-medium mb-1 text-sm">Phone Number</label>
//                   <input
//                     type="tel"
//                     value={phoneNumber}
//                     onChange={(e) => setPhoneNumber(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-gray-900 text-sm"
//                     placeholder="+919876543210"
//                     required
//                     disabled={!usernameValid}
//                   />
//                 </div>
//                 <button
//                   type="submit"
//                   disabled={!usernameValid}
//                   className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 text-sm ${!usernameValid ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:scale-105'}`}
//                 >
//                   Send OTP
//                 </button>
//               </form>
//             )}
//           </>
//         )}

//         {/* SECTION STAGE 3: OTP Code Form Mock Interface Wrapper Panel */}
//         {!showRoleSelection && confirmationResult && (
//           <>
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                 </svg>
//               </div>
//               <h3 className="text-lg font-semibold text-gray-800 mb-2">Verify Your Phone</h3>
//               <p className="text-sm text-gray-600">We&apos;ve sent a code to {phoneNumber}</p>
//               <p className="text-xs text-blue-600 mt-1">(Demo: Use 123456)</p>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-gray-700 font-medium mb-1 text-sm">Enter OTP</label>
//                 <input
//                   type="text"
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center text-lg tracking-widest text-gray-900"
//                   placeholder="123456"
//                   maxLength={6}
//                   required
//                 />
//               </div>
//               <button
//                 onClick={verifyOtp}
//                 className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-105 text-sm"
//               >
//                 Verify and Create Account
//               </button>
//             </div>
            
//             <button
//               onClick={() => setConfirmationResult(null)}
//               className="w-full mt-3 text-gray-600 py-2 text-sm transition-colors hover:text-gray-800 text-center block"
//             >
//               ← Back to phone number
//             </button>
//           </>
//         )}

//         {/* Informative Visual Context Label Field */}
//         {!showRoleSelection && (
//           <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
//             <p className="text-blue-700 text-xs text-center font-medium">
//               You must create a valid username before proceeding.
//             </p>
//           </div>
//         )}
        
//         {/* Navigation Action Anchors Footer Panel Links */}
//         <p className="mt-8 text-center text-gray-600 text-sm">
//           Already have an account?{" "}
//           <Link href="/auth/login" className="text-blue-600 font-medium hover:underline transition-colors hover:text-blue-700">
//             Log In
//           </Link>
//         </p>

//         {/* Copyright Notice Label Layout */}
//         <div className="mt-6 text-center border-t border-gray-100 pt-4">
//           <p className="text-xs text-gray-500">© 2026 B.M.S. College of Engineering</p>
//         </div>

//       </div>
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  // 1. Maintain only the states required by your PostgreSQL/Prisma database schema
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT"); // Matches your Prisma Schema Role enum [STUDENT, CANTEEN_ADMIN]
  
  const [facultyCode, setFacultyCode] = useState('');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const facultySecretCode = "BMSFACULTY2025";

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Faculty verification code guard condition
    if (role === 'CANTEEN_ADMIN' && facultyCode !== facultySecretCode) {
      setError('Incorrect faculty registration code.');
      return;
    }

    setLoading(true);

    try {
      // Execute database mutation dispatch via NextJS route endpoint handlers
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "An account registration error occurred.");
      }

      // Automatically forward user over to auth/login path layout
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden p-4 sm:p-8">
      
      {/* Food Pattern Background Layer */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Cg fill='none' stroke='%23000' stroke-width='2'%3E%3Ccircle cx='100' cy='100' r='40'/%3E%3Cpath d='M80 90h40v20H80z'/%3E%3Ccircle cx='200' cy='150' r='25'/%3E%3Cpath d='M190 140c0-10 5-15 10-15s10 5 10 15-5 15-10 15-10-5-10-15z'/%3E%3Crect x='300' y='80' width='60' height='40' rx='5'/%3E%3Ccircle cx='400' cy='200' r='30'/%3E%3Cpath d='M380 180h40v40H380z'/%3E%3Ccircle cx='150' cy='250' r='20'/%3E%3Cpath d='M130 240h40v20H130z'/%3E%3Ccircle cx='500' cy='120' r='35'/%3E%3Cpath d='M480 100h40v40H480z'/%3E%3Ccircle cx='350' cy='300' r='25'/%3E%3Cpath d='M330 285h40v30H330z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '400px 300px',
          backgroundRepeat: 'repeat'
        }}
      ></div>

      {/* Floating Food Elements Animations */}
      <div className="absolute top-10 left-10 w-8 h-8 bg-white bg-opacity-20 rounded-full animate-bounce"></div>
      <div className="absolute top-20 right-20 w-6 h-6 bg-white bg-opacity-15 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
      <div className="absolute bottom-20 left-20 w-10 h-10 bg-white bg-opacity-10 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      <div className="absolute bottom-10 right-10 w-7 h-7 bg-white bg-opacity-20 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>

      {/* Main Glassmorphism Presentation Container Panel */}
      <div className="bg-white bg-opacity-95 backdrop-blur-lg p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md border border-white border-opacity-20 relative z-10">
        
        {/* College Header Branding Layout Block */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl font-bold text-blue-700 mb-1 leading-tight">
            B.M.S. College of Engineering
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">Established 1946 • Bangalore</p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">Create an Account</h2>
          <p className="text-sm text-gray-600">Join Campus Eats today</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-center text-sm font-medium">{error}</p>
          </div>
        )}

        {/* All Fields Combined Into One Single Page Streamlined Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 text-sm"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 text-sm"
              placeholder="student@bmsce.ac.in"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">Create Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 text-sm"
              placeholder="••••••••"
            />
          </div> */}

          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">I am a:</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 text-sm ${role === 'STUDENT' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('CANTEEN_ADMIN')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 text-sm ${role === 'CANTEEN_ADMIN' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Faculty / Staff
              </button>
            </div>
          </div>

          {role === 'CANTEEN_ADMIN' && (
            <div className="animate-fadeIn">
              <label className="block text-gray-700 font-medium mb-1 text-sm">Faculty Code</label>
              <input
                type="text"
                value={facultyCode}
                onChange={(e) => setFacultyCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 text-sm"
                placeholder="Enter validation code"
                required
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 text-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        {/* Global Footer Navigation Links */}
        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 font-medium hover:underline transition-colors hover:text-blue-700">
            Log In
          </Link>
        </p>

        {/* Copyright Notice Label Layout */}
        <div className="mt-6 text-center border-t border-gray-100 pt-4">
          <p className="text-xs Exploitant text-gray-500">© 2026 B.M.S. College of Engineering</p>
        </div>

      </div>
    </div>
  );
}