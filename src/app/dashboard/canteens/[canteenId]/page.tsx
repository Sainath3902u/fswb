// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { 
//   ArrowLeft, Heart, Search, ShoppingCart, 
//   Home, Package, Plus, Minus, X, Star 
// } from "lucide-react";

// interface MenuItem {
//   id: string;
//   name: string;
//   description: string | null;
//   price: number;
//   originalPrice?: number;
//   savings?: number;
//   image: string;
//   category: { id: string; name: string; icon: string }; // ✨ CHANGED: Matches new Prisma relational layout
//   rating?: number;
//   deliveryTime?: string;
//   weight?: string;
//   isAvailable: boolean;
// }

// interface CategoryItem {
//   id: string;
//   name: string;
//   icon: string;
// }

// export default function CanteenMenuPage() {
//   const router = useRouter();
//   const params = useParams();
//   const canteenId = params.canteenId as string;

//   // State Management
//   const [canteenName, setCanteenName] = useState<string>("Canteen Menu");
//   const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
//   const [categories, setCategories] = useState<CategoryItem[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [pageLoading, setPageLoading] = useState<boolean>(true);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  
//   const [cartItems, setCartItems] = useState<any[]>([]); 
//   const [wishlist, setWishlist] = useState<string[]>([]);

//   useEffect(() => {
//   // Load basket item counts on initialization
//   const savedCart = localStorage.getItem("cart");
//   if (savedCart) {
//     setCartItems(JSON.parse(savedCart));
//   }
// }, []);

//   // 1. Core Data Fetching Effect (PostgreSQL & Prisma API Pipe)
//   useEffect(() => {
//     if (!canteenId) return;

//     async function fetchMenuData() {
//       try {
//         setPageLoading(true);
//         const res = await fetch(`/api/canteens/${canteenId}/menu`);
//         const data = await res.json();

//         if (data.success && data.menuItems) {
//           const items: MenuItem[] = data.menuItems;
//           setMenuItems(items);

//           // ✨ CHANGED: Extracts unique category names using the nested object relation line
//           const uniqueCategoryNames = Array.from(
//             new Set(items.map(i => i.category?.name).filter(Boolean))
//           );
          
//           // ✨ CHANGED: Maps category objects extracting matching icons from database records directly
//           const builtCategories: CategoryItem[] = uniqueCategoryNames.map((catName, idx) => {
//             const match = items.find(i => i.category?.name === catName);
//             return {
//               id: `cat-${idx}`,
//               name: catName,
//               icon: match?.category?.icon || "🍽️"
//             };
//           });

//           setCategories(builtCategories);

//           if (builtCategories.length > 0) {
//             setSelectedCategory(builtCategories[0].name);
//           }
//         }
//       } catch (error) {
//         console.error("Error connecting to Prisma API:", error);
//       } finally {
//         setPageLoading(false);
//       }
//     }

//     fetchMenuData();
//   }, [canteenId]);

//   // Wishlist Handling Action Handler
//   const handleToggleWishlist = (itemId: string) => {
//     setWishlist(prev => 
//       prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
//     );
//   };

//   // 🛒 1. Update ADD TO CART function
// const addToCart = (item: MenuItem) => {
//   // Read existing cart from localStorage first
//   const existingCartRaw = localStorage.getItem("cart");
//   let currentCart = existingCartRaw ? JSON.parse(existingCartRaw) : [];

//   // Check if item already exists
//   const existingItemIndex = currentCart.findIndex((c: any) => c.id === item.id);

//   if (existingItemIndex > -1) {
//     currentCart[existingItemIndex].quantity += 1;
//   } else {
//     currentCart.push({
//       id: item.id,
//       quantity: 1,
//       canteenId: canteenId // Extracted from URL params
//     });
//   }

//   // Update component UI state
//   setCartItems(currentCart);
//   // ✨ CRITICAL: Save to localStorage so Cart Page can read it!
//   localStorage.setItem("cart", JSON.stringify(currentCart));
// };

// // 🔄 2. Update CHANGE QUANTITY function (+ and - buttons)
// const changeQuantity = (itemId: string, amount: number) => {
//   const existingCartRaw = localStorage.getItem("cart");
//   if (!existingCartRaw) return;
  
//   let currentCart = JSON.parse(existingCartRaw);

//   const updatedCart = currentCart.map((item: any) => {
//     if (item.id === itemId) {
//       return { ...item, quantity: Math.max(0, item.quantity + amount) };
//     }
//     return item;
//   }).filter((item: any) => item.quantity > 0); // Remove items if quantity hits 0

//   // Update component UI state
//   setCartItems(updatedCart);
//   // ✨ CRITICAL: Save to localStorage so Cart Page stays in sync!
//   localStorage.setItem("cart", JSON.stringify(updatedCart));
// };

//   // Advanced Filtering Array Logic matching your exact search & category constraints
//   const filteredItems = menuItems.filter(item => {
//     // ✨ CHANGED: Validates category matching strings by targeting item.category.name
//     const matchesCategory = selectedCategory === "Wishlist" 
//       ? wishlist.includes(item.id) 
//       : item.category?.name === selectedCategory;
//     const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

//   if (pageLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen bg-gray-50 flex flex-col antialiased">
//       {/* Header Bar */}
//       <header className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 flex items-center justify-between border-b border-gray-100">
//         <div className="flex items-center gap-3">
//           <button 
//             onClick={() => router.back()}
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
//           >
//             <ArrowLeft className="w-5 h-5 text-gray-700" />
//           </button>
//           <h1 className="text-lg font-bold text-gray-800">{canteenName}</h1>
//         </div>
        
//         <div className="flex items-center gap-1">
//           <button 
//             onClick={() => {
//               if (!categories.some(c => c.id === "wishlist")) {
//                 setCategories(prev => [{ id: "wishlist", name: "Wishlist", icon: "❤️" }, ...prev]);
//               }
//               setSelectedCategory("Wishlist");
//             }}
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
//           >
//             <Heart className={`w-5 h-5 ${wishlist.length > 0 ? "text-red-500 fill-red-500" : "text-gray-600"}`} />
//           </button>
//           <button 
//             onClick={() => setShowSearchModal(true)}
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//           >
//             <Search className="w-5 h-5 text-gray-600" />
//           </button>
//         </div>
//       </header>

//       {/* Dynamic Overlay Search Panel */}
//       {showSearchModal && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
//             <div className="p-4 flex items-center gap-3 border-b">
//               <Search className="w-5 h-5 text-gray-400" />
//               <input 
//                 type="text" 
//                 placeholder="Search for food items..." 
//                 value={searchQuery} 
//                 onChange={(e) => setSearchQuery(e.target.value)} 
//                 className="flex-1 outline-none text-gray-800 font-medium placeholder-gray-400" 
//                 autoFocus 
//               />
//               <button 
//                 onClick={() => { setShowSearchModal(false); setSearchQuery(""); }} 
//                 className="p-1 hover:bg-gray-100 rounded-full"
//               >
//                 <X className="w-5 h-5 text-gray-400" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Primary Split Viewport Area */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* Left Interactive Sidebar Categories Container */}
//         <div className="w-24 md:w-28 bg-white border-r border-gray-100 overflow-y-auto flex-shrink-0 pb-24">
//           <div className="py-1">
//             {categories.map((category) => (
//               <button
//                 key={category.id}
//                 onClick={() => setSelectedCategory(category.name)}
//                 className={`w-full px-2 py-4 flex flex-col items-center gap-1.5 text-xs transition-all relative ${
//                   selectedCategory === category.name
//                     ? "bg-orange-50 font-bold text-orange-600"
//                     : "text-gray-500 hover:bg-gray-50 font-medium"
//                 }`}
//               >
//                 {selectedCategory === category.name && (
//                   <div className="absolute right-0 top-0 h-full w-1 bg-orange-500 rounded-l" />
//                 )}
//                 <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-transform ${
//                   selectedCategory === category.name ? "bg-orange-500 text-white scale-105 shadow-sm" : "bg-gray-50"
//                 }`}>
//                   {category.icon}
//                 </div>
//                 <span className="text-center leading-tight tracking-tight mt-0.5">{category.name}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Right Menu Items Dynamic Scrolling Container */}
//         <div className="flex-1 overflow-y-auto bg-gray-50/50 pb-24">
//           <div className="p-4 space-y-4">
            
//             {/* Promotional Graphic Header Banner */}
//             <div 
//               className="h-36 rounded-2xl relative overflow-hidden bg-cover bg-center shadow-sm" 
//               style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&fit=crop')` }}
//             >
//               <div className="absolute inset-0 flex flex-col justify-center px-6">
//                 <h2 className="text-xl font-black text-white leading-tight">Fresh College Flavors</h2>
//                 <p className="text-xs text-white/90 mt-1 max-w-xs">Prepared clean, packed safe, delivered hot instantly inside campus parameters.</p>
//               </div>
//             </div>

//             {/* Menu Items Matrix Layout Grid */}
//             <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
//               {filteredItems.map(item => {
//                 const itemInCart = cartItems.find(c => c.id === item.id);
//                 const isWishlisted = wishlist.includes(item.id);
//                 const inStock = item.isAvailable;

//                 return (
//                   <div 
//                     key={item.id} 
//                     className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all duration-200 ${
//                       !inStock ? "opacity-60 bg-gray-50" : "hover:shadow-md hover:scale-[1.01]"
//                     }`}
//                   >
//                     {/* Dynamic Thumbnail Banner Block */}
//                     <div className="relative h-28 w-full bg-gray-100">
//                       <img 
//                         src={item.image || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400"} 
//                         alt={item.name}
//                         className="w-full h-full object-cover"
//                       />
                      
//                       <button 
//                         onClick={() => handleToggleWishlist(item.id)}
//                         className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 shadow-sm transition-transform"
//                       >
//                         <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
//                       </button>

//                       {!inStock && (
//                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
//                           <span className="text-white font-bold bg-black/60 px-2.5 py-1 rounded-full text-[10px] tracking-wider">
//                             OUT OF STOCK
//                           </span>
//                         </div>
//                       )}
//                     </div>

//                     {/* Metadata Content Information Card Body */}
//                     <div className="p-3 flex flex-col flex-grow">
//                       <h3 className="font-bold text-gray-800 text-sm line-clamp-2 min-h-[2.5rem] leading-snug">
//                         {item.name}
//                       </h3>
                      
//                       <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-gray-500">
//                         <Star className="w-3 h-3 fill-green-500 text-green-500" />
//                         <span>{item.rating || "4.2"}</span>
//                         <span className="text-gray-300">|</span>
//                         <span>{item.deliveryTime || "10 mins"}</span>
//                       </div>

//                       {/* Financial pricing rows block */}
//                       <div className="flex items-baseline gap-1.5 mt-2.5">
//                         <span className="text-base font-black text-gray-900">₹{item.price}</span>
//                         {item.originalPrice && (
//                           <span className="text-xs text-gray-400 line-through">₹{item.originalPrice}</span>
//                         )}
//                       </div>

//                       {/* Interactive Basket Action Controller Increment Toggles */}
//                       <div className="mt-auto pt-3">
//                         {itemInCart ? (
//                           <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-1 animate-in fade-in duration-100">
//                             <button
//                               onClick={() => changeQuantity(item.id, -1)}
//                               className="w-7 h-7 bg-white border border-orange-200 shadow-sm rounded-lg flex items-center justify-center text-orange-500 active:scale-90 transition-transform"
//                             >
//                               <Minus className="w-3.5 h-3.5" />
//                             </button>
//                             <span className="font-bold text-orange-600 text-sm">
//                               {itemInCart.quantity}
//                             </span>
//                             <button
//                               onClick={() => changeQuantity(item.id, 1)}
//                               className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-orange-600"
//                             >
//                               <Plus className="w-3.5 h-3.5" />
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             onClick={() => addToCart(item)}
//                             disabled={!inStock}
//                             className="w-full bg-white border border-orange-500 text-orange-500 py-1.5 rounded-xl font-bold text-xs hover:bg-orange-50 transition-colors flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] disabled:border-gray-200 disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
//                           >
//                             <Plus className="w-3.5 h-3.5" />
//                             ADD
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Zero State Fallback Alert Message Box */}
//             {filteredItems.length === 0 && (
//               <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
//                 <p className="text-sm font-bold text-gray-800">No items available</p>
//                 <p className="text-xs text-gray-400 mt-1">There aren't any options matching this request context right now.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Persistent Bottom Floating Navigation Matrix Bar */}
//       <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-lg flex justify-around py-2 px-4 z-40 safe-bottom">
//         <Link href="/dashboard" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-orange-500 transition-colors py-1">
//           <Home className="w-5 h-5" />
//           <span className="text-[10px] font-bold mt-0.5">Home</span>
//         </Link>
//         <Link href="/dashboard/orders" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-orange-500 transition-colors py-1">
//           <Package className="w-5 h-5" />
//           <span className="text-[10px] font-bold mt-0.5">Orders</span>
//         </Link>
//         <Link href="/dashboard/cart" className="flex flex-col items-center gap-0.5 text-orange-600 transition-colors py-1 relative">
//           <div className="relative">
//             <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
//             {totalCartItems > 0 && (
//               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-sm border border-white animate-bounce">
//                 {totalCartItems > 9 ? "9+" : totalCartItems}
//               </span>
//             )}
//           </div>
//           <span className="text-[10px] font-black mt-0.5">Cart</span>
//         </Link>
//       </nav>
//     </div>
//   );
// }





// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { 
//   ArrowLeft, Heart, Search, ShoppingCart, 
//   Home, Package, Plus, Minus, X, Star 
// } from "lucide-react";

// interface MenuItem {
//   id: string;
//   name: string;
//   description: string | null;
//   price: number;
//   originalPrice?: number;
//   savings?: number;
//   image: string;
//   category: { id: string; name: string; icon: string };
//   rating?: number;
//   deliveryTime?: string;
//   weight?: string;
//   isAvailable: boolean;
// }

// interface CategoryItem {
//   id: string;
//   name: string;
//   icon: string;
// }

// export default function CanteenMenuPage() {
//   const router = useRouter();
//   const params = useParams();
//   const canteenId = params.canteenId as string;

//   // State Management
//   const [canteenName, setCanteenName] = useState<string>("Canteen Menu");
//   const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
//   const [categories, setCategories] = useState<CategoryItem[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [pageLoading, setPageLoading] = useState<boolean>(true);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  
//   const [cartItems, setCartItems] = useState<any[]>([]); 
//   const [wishlist, setWishlist] = useState<string[]>([]);

//   useEffect(() => {
//     const savedCart = localStorage.getItem("cart");
//     if (savedCart) {
//       setCartItems(JSON.parse(savedCart));
//     }
//   }, []);

//   // 1. Core Data Fetching Effect (Passes ?all=true so out-of-stock items are received to be greyed out)
//   useEffect(() => {
//     if (!canteenId) return;

//     async function fetchMenuData() {
//       try {
//         setPageLoading(true);
//         const res = await fetch(`/api/canteens/${canteenId}/menu?all=true`);
//         const data = await res.json();

//         if (data.success && (data.menuItems || data.menu)) {
//           const items: MenuItem[] = data.menuItems || data.menu;
//           setMenuItems(items);

//           const uniqueCategoryNames = Array.from(
//             new Set(items.map(i => i.category?.name).filter(Boolean))
//           );
          
//           const builtCategories: CategoryItem[] = uniqueCategoryNames.map((catName, idx) => {
//             const match = items.find(i => i.category?.name === catName);
//             return {
//               id: `cat-${idx}`,
//               name: catName,
//               icon: match?.category?.icon || "🍽️"
//             };
//           });

//           setCategories(builtCategories);

//           if (builtCategories.length > 0) {
//             setSelectedCategory(builtCategories[0].name);
//           }
//         }
//       } catch (error) {
//         console.error("Error connecting to Prisma API:", error);
//       } finally {
//         setPageLoading(false);
//       }
//     }

//     fetchMenuData();
//   }, [canteenId]);

//   const handleToggleWishlist = (itemId: string) => {
//     setWishlist(prev => 
//       prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
//     );
//   };

//   const addToCart = (item: MenuItem) => {
//     const existingCartRaw = localStorage.getItem("cart");
//     let currentCart = existingCartRaw ? JSON.parse(existingCartRaw) : [];
//     const existingItemIndex = currentCart.findIndex((c: any) => c.id === item.id);

//     if (existingItemIndex > -1) {
//       currentCart[existingItemIndex].quantity += 1;
//     } else {
//       currentCart.push({
//         id: item.id,
//         quantity: 1,
//         canteenId: canteenId
//       });
//     }

//     setCartItems(currentCart);
//     localStorage.setItem("cart", JSON.stringify(currentCart));
//   };

//   const changeQuantity = (itemId: string, amount: number) => {
//     const existingCartRaw = localStorage.getItem("cart");
//     if (!existingCartRaw) return;
    
//     let currentCart = JSON.parse(existingCartRaw);
//     const updatedCart = currentCart.map((item: any) => {
//       if (item.id === itemId) {
//         return { ...item, quantity: Math.max(0, item.quantity + amount) };
//       }
//       return item;
//     }).filter((item: any) => item.quantity > 0);

//     setCartItems(updatedCart);
//     localStorage.setItem("cart", JSON.stringify(updatedCart));
//   };

//   const filteredItems = menuItems.filter(item => {
//     const matchesCategory = selectedCategory === "Wishlist" 
//       ? wishlist.includes(item.id) 
//       : item.category?.name === selectedCategory;
//     const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

//   if (pageLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen bg-gray-50 flex flex-col antialiased">
//       {/* Header Bar */}
//       <header className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 flex items-center justify-between border-b border-gray-100">
//         <div className="flex items-center gap-3">
//           <button 
//             onClick={() => router.back()}
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
//           >
//             <ArrowLeft className="w-5 h-5 text-gray-700" />
//           </button>
//           <h1 className="text-lg font-bold text-gray-800">{canteenName}</h1>
//         </div>
        
//         <div className="flex items-center gap-1">
//           <button 
//             onClick={() => {
//               if (!categories.some(c => c.id === "wishlist")) {
//                 setCategories(prev => [{ id: "wishlist", name: "Wishlist", icon: "❤️" }, ...prev]);
//               }
//               setSelectedCategory("Wishlist");
//             }}
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
//           >
//             <Heart className={`w-5 h-5 ${wishlist.length > 0 ? "text-red-500 fill-red-500" : "text-gray-600"}`} />
//           </button>
//           <button 
//             onClick={() => setShowSearchModal(true)}
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//           >
//             <Search className="w-5 h-5 text-gray-600" />
//           </button>
//         </div>
//       </header>

//       {/* Dynamic Overlay Search Panel */}
//       {showSearchModal && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
//             <div className="p-4 flex items-center gap-3 border-b">
//               <Search className="w-5 h-5 text-gray-400" />
//               <input 
//                 type="text" 
//                 placeholder="Search for food items..." 
//                 value={searchQuery} 
//                 onChange={(e) => setSearchQuery(e.target.value)} 
//                 className="flex-1 outline-none text-gray-800 font-medium placeholder-gray-400" 
//                 autoFocus 
//               />
//               <button 
//                 onClick={() => { setShowSearchModal(false); setSearchQuery(""); }} 
//                 className="p-1 hover:bg-gray-100 rounded-full"
//               >
//                 <X className="w-5 h-5 text-gray-400" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="flex flex-1 overflow-hidden">
//         {/* Left Interactive Sidebar Categories Container */}
//         <div className="w-24 md:w-28 bg-white border-r border-gray-100 overflow-y-auto flex-shrink-0 pb-24">
//           <div className="py-1">
//             {categories.map((category) => (
//               <button
//                 key={category.id}
//                 onClick={() => setSelectedCategory(category.name)}
//                 className={`w-full px-2 py-4 flex flex-col items-center gap-1.5 text-xs transition-all relative ${
//                   selectedCategory === category.name
//                     ? "bg-orange-50 font-bold text-orange-600"
//                     : "text-gray-500 hover:bg-gray-50 font-medium"
//                 }`}
//               >
//                 {selectedCategory === category.name && (
//                   <div className="absolute right-0 top-0 h-full w-1 bg-orange-500 rounded-l" />
//                 )}
//                 <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-transform ${
//                   selectedCategory === category.name ? "bg-orange-500 text-white scale-105 shadow-sm" : "bg-gray-50"
//                 }`}>
//                   {category.icon}
//                 </div>
//                 <span className="text-center leading-tight tracking-tight mt-0.5">{category.name}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Right Menu Items Dynamic Scrolling Container */}
//         <div className="flex-1 overflow-y-auto bg-gray-50/50 pb-24">
//           <div className="p-4 space-y-4">
//             <div 
//               className="h-36 rounded-2xl relative overflow-hidden bg-cover bg-center shadow-sm" 
//               style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&fit=crop')` }}
//             >
//               <div className="absolute inset-0 flex flex-col justify-center px-6">
//                 <h2 className="text-xl font-black text-white leading-tight">Fresh College Flavors</h2>
//                 <p className="text-xs text-white/90 mt-1 max-w-xs">Prepared clean, packed safe, delivered hot instantly inside campus parameters.</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
//               {filteredItems.map(item => {
//                 const itemInCart = cartItems.find(c => c.id === item.id);
//                 const isWishlisted = wishlist.includes(item.id);
//                 const inStock = item.isAvailable;

//                 return (
//                   <div 
//                     key={item.id} 
//                     className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all duration-200 ${
//                       !inStock ? "opacity-50 bg-gray-100 cursor-not-allowed select-none" : "hover:shadow-md hover:scale-[1.01]"
//                     }`}
//                   >
//                     <div className="relative h-28 w-full bg-gray-100">
//                       <Image 
//                         src={item.image || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400"} 
//                         alt={item.name}
//                         fill
//                         unoptimized
//                         className="object-cover"
//                       />
                      
//                       <button 
//                         onClick={() => handleToggleWishlist(item.id)}
//                         disabled={!inStock}
//                         className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 shadow-sm transition-transform z-10"
//                       >
//                         <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
//                       </button>

//                       {!inStock && (
//                         <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
//                           <span className="text-white font-black bg-red-600 px-2.5 py-1 rounded-md text-[10px] tracking-wider border border-white/10 shadow">
//                             OUT OF STOCK
//                           </span>
//                         </div>
//                       )}
//                     </div>

//                     <div className="p-3 flex flex-col flex-grow">
//                       <h3 className="font-bold text-gray-800 text-sm line-clamp-2 min-h-[2.5rem] leading-snug">
//                         {item.name}
//                       </h3>
                      
//                       <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-gray-500">
//                         <Star className="w-3 h-3 fill-green-500 text-green-500" />
//                         <span>{item.rating || "4.2"}</span>
//                         <span className="text-gray-300">|</span>
//                         <span>{item.deliveryTime || "10 mins"}</span>
//                       </div>

//                       <div className="flex items-baseline gap-1.5 mt-2.5">
//                         <span className="text-base font-black text-gray-900">₹{item.price}</span>
//                         {item.originalPrice && (
//                           <span className="text-xs text-gray-400 line-through">₹{item.originalPrice}</span>
//                         )}
//                       </div>

//                       <div className="mt-auto pt-3">
//                         {itemInCart ? (
//                           <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-1 animate-in fade-in duration-100">
//                             <button
//                               onClick={() => changeQuantity(item.id, -1)}
//                               className="w-7 h-7 bg-white border border-orange-200 shadow-sm rounded-lg flex items-center justify-center text-orange-500 active:scale-90 transition-transform"
//                             >
//                               <Minus className="w-3.5 h-3.5" />
//                             </button>
//                             <span className="font-bold text-orange-600 text-sm">
//                               {itemInCart.quantity}
//                             </span>
//                             <button
//                               onClick={() => changeQuantity(item.id, 1)}
//                               disabled={!inStock} // ✨ FIX 1: Blocks adding more item quantity if item is out of stock
//                               className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
//                             >
//                               <Plus className="w-3.5 h-3.5" />
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             onClick={() => addToCart(item)}
//                             disabled={!inStock}
//                             className="w-full bg-white border border-orange-500 text-orange-500 py-1.5 rounded-xl font-bold text-xs hover:bg-orange-50 transition-colors flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] disabled:border-gray-200 disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
//                           >
//                             <Plus className="w-3.5 h-3.5" />
//                             ADD
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {filteredItems.length === 0 && (
//               <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
//                 <p className="text-sm font-bold text-gray-800">No items available</p>
//                 <p className="text-xs text-gray-400 mt-1">There aren't any options matching this request context right now.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-lg flex justify-around py-2 px-4 z-40 safe-bottom">
//         <Link href="/dashboard" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-orange-500 transition-colors py-1">
//           <Home className="w-5 h-5" />
//           <span className="text-[10px] font-bold mt-0.5">Home</span>
//         </Link>
//         <Link href="/dashboard/orders" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-orange-500 transition-colors py-1">
//           <Package className="w-5 h-5" />
//           <span className="text-[10px] font-bold mt-0.5">Orders</span>
//         </Link>
//         <Link href="/dashboard/cart" className="flex flex-col items-center gap-0.5 text-orange-600 transition-colors py-1 relative">
//           <div className="relative">
//             <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
//             {totalCartItems > 0 && (
//               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-sm border border-white animate-bounce">
//                 {totalCartItems > 9 ? "9+" : totalCartItems}
//               </span>
//             )}
//           </div>
//           <span className="text-[10px] font-black mt-0.5">Cart</span>
//         </Link>
//       </nav>
//     </div>
//   );
// }





"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, Heart, Search, ShoppingCart, 
  Home, Package, Plus, Minus, X, Star 
} from "lucide-react";
// 1. ✨ Import Pusher Client for browser interactive streams
import PusherClient from "pusher-js";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  savings?: number;
  image: string;
  category: { id: string; name: string; icon: string };
  rating?: number;
  deliveryTime?: string;
  weight?: string;
  isAvailable: boolean;
}

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
}

export default function CanteenMenuPage() {
  const router = useRouter();
  const params = useParams();
  const canteenId = params.canteenId as string;

  // State Management
  const [canteenName, setCanteenName] = useState<string>("Canteen Menu");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  
  const [cartItems, setCartItems] = useState<any[]>([]); 
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // 1. Core Data Fetching Effect (Passes ?all=true so out-of-stock items are received to be greyed out)
  useEffect(() => {
    if (!canteenId) return;

    async function fetchMenuData() {
      try {
        setPageLoading(true);
        const res = await fetch(`/api/canteens/${canteenId}/menu?all=true`);
        const data = await res.json();

        if (data.success && (data.menuItems || data.menu)) {
          const items: MenuItem[] = data.menuItems || data.menu;
          setMenuItems(items);

          const uniqueCategoryNames = Array.from(
            new Set(items.map(i => i.category?.name).filter(Boolean))
          );
          
          const builtCategories: CategoryItem[] = uniqueCategoryNames.map((catName, idx) => {
            const match = items.find(i => i.category?.name === catName);
            return {
              id: `cat-${idx}`,
              name: catName,
              icon: match?.category?.icon || "🍽️"
            };
          });

          setCategories(builtCategories);

          if (builtCategories.length > 0) {
            setSelectedCategory(builtCategories[0].name);
          }
        }
      } catch (error) {
        console.error("Error connecting to Prisma API:", error);
      } finally {
        setPageLoading(false);
      }
    }

    fetchMenuData();
  }, [canteenId]);

  // ✨ NEW: Real-Time Pusher Live Stock Synchronization Effect Hook
  useEffect(() => {
    if (!canteenId) return;

    // Initialize the browser client instance using your exact app credentials
    const pusherClient = new PusherClient("4ea74b7ade3151df8b06", {
      cluster: "ap2",
    });

    // Subscribe to the canteen's individual notification room channel
    const channel = pusherClient.subscribe(`canteen-${canteenId}`);

    // Bind event to seamlessly swap out the state parameter arrays instantly
    channel.bind("menu-stock-updated", (data: { menuItemId: string; isAvailable: boolean }) => {
      console.log("📡 Real-time stock change caught live:", data);
      
      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          item.id === data.menuItemId 
            ? { ...item, isAvailable: data.isAvailable } 
            : item
        )
      );
    });

    // Clean up connections when the customer switches pages or leaves the screen
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusherClient.disconnect();
    };
  }, [canteenId]);

  const handleToggleWishlist = (itemId: string) => {
    setWishlist(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const addToCart = (item: MenuItem) => {
    const existingCartRaw = localStorage.getItem("cart");
    let currentCart = existingCartRaw ? JSON.parse(existingCartRaw) : [];
    const existingItemIndex = currentCart.findIndex((c: any) => c.id === item.id);

    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({
        id: item.id,
        quantity: 1,
        canteenId: canteenId
      });
    }

    setCartItems(currentCart);
    localStorage.setItem("cart", JSON.stringify(currentCart));
  };

  const changeQuantity = (itemId: string, amount: number) => {
    const existingCartRaw = localStorage.getItem("cart");
    if (!existingCartRaw) return;
    
    let currentCart = JSON.parse(existingCartRaw);
    const updatedCart = currentCart.map((item: any) => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(0, item.quantity + amount) };
      }
      return item;
    }).filter((item: any) => item.quantity > 0);

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === "Wishlist" 
      ? wishlist.includes(item.id) 
      : item.category?.name === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col antialiased">
      {/* Header Bar */}
      <header className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">{canteenName}</h1>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              if (!categories.some(c => c.id === "wishlist")) {
                setCategories(prev => [{ id: "wishlist", name: "Wishlist", icon: "❤️" }, ...prev]);
              }
              setSelectedCategory("Wishlist");
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? "text-red-500 fill-red-500" : "text-gray-600"}`} />
          </button>
          <button 
            onClick={() => setShowSearchModal(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Dynamic Overlay Search Panel */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 flex items-center gap-3 border-b">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search for food items..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="flex-1 outline-none text-gray-800 font-medium placeholder-gray-400" 
                autoFocus 
              />
              <button 
                onClick={() => { setShowSearchModal(false); setSearchQuery(""); }} 
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left Interactive Sidebar Categories Container */}
        <div className="w-24 md:w-28 bg-white border-r border-gray-100 overflow-y-auto flex-shrink-0 pb-24">
          <div className="py-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`w-full px-2 py-4 flex flex-col items-center gap-1.5 text-xs transition-all relative ${
                  selectedCategory === category.name
                    ? "bg-orange-50 font-bold text-orange-600"
                    : "text-gray-500 hover:bg-gray-50 font-medium"
                }`}
              >
                {selectedCategory === category.name && (
                  <div className="absolute right-0 top-0 h-full w-1 bg-orange-500 rounded-l" />
                )}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-transform ${
                  selectedCategory === category.name ? "bg-orange-500 text-white scale-105 shadow-sm" : "bg-gray-50"
                }`}>
                  {category.icon}
                </div>
                <span className="text-center leading-tight tracking-tight mt-0.5">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Menu Items Dynamic Scrolling Container */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 pb-24">
          <div className="p-4 space-y-4">
            <div 
              className="h-36 rounded-2xl relative overflow-hidden bg-cover bg-center shadow-sm" 
              style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&fit=crop')` }}
            >
              <div className="absolute inset-0 flex flex-col justify-center px-6">
                <h2 className="text-xl font-black text-white leading-tight">Fresh College Flavors</h2>
                <p className="text-xs text-white/90 mt-1 max-w-xs">Prepared clean, packed safe, delivered hot instantly inside campus parameters.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredItems.map(item => {
                const itemInCart = cartItems.find(c => c.id === item.id);
                const isWishlisted = wishlist.includes(item.id);
                const inStock = item.isAvailable;

                return (
                  <div 
                    key={item.id} 
                    className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all duration-200 ${
                      !inStock ? "opacity-50 bg-gray-100 cursor-not-allowed select-none" : "hover:shadow-md hover:scale-[1.01]"
                    }`}
                  >
                    <div className="relative h-28 w-full bg-gray-100">
                      <Image 
                        src={item.image || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400"} 
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      
                      <button 
                        onClick={() => handleToggleWishlist(item.id)}
                        disabled={!inStock}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 shadow-sm transition-transform z-10"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
                      </button>

                      {!inStock && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                          <span className="text-white font-black bg-red-600 px-2.5 py-1 rounded-md text-[10px] tracking-wider border border-white/10 shadow">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 flex flex-col flex-grow">
                      <h3 className="font-bold text-gray-800 text-sm line-clamp-2 min-h-[2.5rem] leading-snug">
                        {item.name}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-gray-500">
                        <Star className="w-3 h-3 fill-green-500 text-green-500" />
                        <span>{item.rating || "4.2"}</span>
                        <span className="text-gray-300">|</span>
                        <span>{item.deliveryTime || "10 mins"}</span>
                      </div>

                      <div className="flex items-baseline gap-1.5 mt-2.5">
                        <span className="text-base font-black text-gray-900">₹{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">₹{item.originalPrice}</span>
                        )}
                      </div>

                      <div className="mt-auto pt-3">
                        {itemInCart ? (
                          <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-1 animate-in fade-in duration-100">
                            <button
                              onClick={() => changeQuantity(item.id, -1)}
                              className="w-7 h-7 bg-white border border-orange-200 shadow-sm rounded-lg flex items-center justify-center text-orange-500 active:scale-90 transition-transform"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold text-orange-600 text-sm">
                              {itemInCart.quantity}
                            </span>
                            <button
                              onClick={() => changeQuantity(item.id, 1)}
                              disabled={!inStock}
                              className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            disabled={!inStock}
                            className="w-full bg-white border border-orange-500 text-orange-500 py-1.5 rounded-xl font-bold text-xs hover:bg-orange-50 transition-colors flex items-center justify-center gap-1 shadow-sm active:scale-[0.98] disabled:border-gray-200 disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            ADD
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <p className="text-sm font-bold text-gray-800">No items available</p>
                <p className="text-xs text-gray-400 mt-1">There aren't any options matching this request context right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-lg flex justify-around py-2 px-4 z-40 safe-bottom">
        <Link href="/dashboard" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-orange-500 transition-colors py-1">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>
        <Link href="/dashboard/orders" className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-orange-500 transition-colors py-1">
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Orders</span>
        </Link>
        <Link href="/dashboard/cart" className="flex flex-col items-center gap-0.5 text-orange-600 transition-colors py-1 relative">
          <div className="relative">
            <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
            {totalCartItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-sm border border-white animate-bounce">
                {totalCartItems > 9 ? "9+" : totalCartItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-black mt-0.5">Cart</span>
        </Link>
      </nav>
    </div>
  );
}