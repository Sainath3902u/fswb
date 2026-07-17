// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { ArrowLeft, Star, PackageCheck, PackageX, ClipboardList } from 'lucide-react';

// interface Category {
//   id: string;
//   name: string;
//   icon: string;
// }

// interface MenuItem {
//   id: string;
//   name: string;
//   price: number;
//   image?: string | null;
//   rating: number | null;
//   isAvailable: boolean;
//   categoryId: string;
// }

// export default function ManageMenuPage() {
//   const router = useRouter();
  
//   const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
//   const [authLoading, setAuthLoading] = useState(true);
//   const [pageLoading, setPageLoading] = useState(true);
//   const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({});
//   const [ownerUser, setOwnerUser] = useState<any>(null);

//   // 1. Authorization Access Check Loop
//   useEffect(() => {
//     const cachedUser = localStorage.getItem("user");
//     if (!cachedUser) {
//       router.push('/auth/login');
//       return;
//     }

//     const parsedUser = JSON.parse(cachedUser);
//     if (parsedUser.role !== 'CANTEEN_ADMIN') {
//       router.push('/dashboard'); 
//       return;
//     }

//     setOwnerUser(parsedUser);
//     setAuthLoading(false);
//   }, [router]);

//   // 2. Fetch Menu and Category Layout Fields from API Gateway
//   useEffect(() => {
//     if (!ownerUser) return;

//     const activeCanteenId = ownerUser.canteenId || ownerUser.canteenID || "";
//     if (!activeCanteenId) return;

//     const fetchMenuData = async () => {
//       try {
//         // Fetch Menu categories layout models
//         const catRes = await fetch(`/api/canteens/categories?canteenId=${activeCanteenId}`);
//         const catData = await catRes.json();
        
//         let fetchedCategories: Category[] = [];
//         if (catData.success && catData.categories) {
//           fetchedCategories = catData.categories;
//           setCategories(fetchedCategories);
//         }

//         // Fetch Canteen Menu Items array
//         const menuRes = await fetch(`/api/canteens/${activeCanteenId}/menu?all=true`);
//         const menuData = await menuRes.json();
        
//         if (menuData.success && menuData.menu) {
//           setMenuItems(menuData.menu);
//         }

//         // ✨ FIX: Initialize the default category selection using .id instead of name
//         if (fetchedCategories.length > 0) {
//           setSelectedCategoryId(fetchedCategories[0].id);
//         }
//       } catch (error) {
//         console.error("Error loading menu structural matrices:", error);
//       } finally {
//         setPageLoading(false);
//       }
//     };

//     fetchMenuData();
//   }, [ownerUser]);

//   if (authLoading || pageLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   // 3. Toggle Stock Value parameters via Backend Actions
//   const handleToggleAvailability = async (item: MenuItem) => {
//     const newStatus = !item.isAvailable;
    
//     setUpdatingItems(prev => ({ ...prev, [item.id]: true }));

//     try {
//       const res = await fetch(`/api/canteens/menu/update-stock`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ menuItemId: item.id, isAvailable: newStatus })
//       });
      
//       const data = await res.json();
      
//       if (data.success) {
//         setMenuItems(prevItems =>
//           prevItems.map(m => m.id === item.id ? { ...m, isAvailable: newStatus } : m)
//         );
//       } else {
//         alert("Failed to update status: " + data.error);
//       }
//     } catch (error) {
//       console.error("Error shifting stock flag settings:", error);
//     } finally {
//       setUpdatingItems(prev => ({ ...prev, [item.id]: false }));
//     }
//   };

//   // ✨ FIX: Match strictly on item.categoryId relation string
//   const filteredItems = menuItems
//     .filter(item => item.categoryId === selectedCategoryId)
//     .sort((a, b) => (a.isAvailable === b.isAvailable ? 0 : a.isAvailable ? -1 : 1));

//   return (
//     <div className="h-screen bg-gray-50 flex flex-col antialiased text-gray-900">
//       {/* Header Container */}
//       <header className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 flex items-center justify-between border-b">
//         <div className="flex items-center gap-3">
//           <button 
//             onClick={() => router.push('/canteen/dashboard')}
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors border"
//           >
//             <ArrowLeft className="w-5 h-5 text-gray-600" />
//           </button>
//           <div>
//             <h1 className="text-base font-black text-gray-900">Manage Menu Stock</h1>
//             <p className="text-[11px] text-orange-600 font-bold">Instantly enable/disable items for students</p>
//           </div>
//         </div>
//       </header>
      
//       <div className="flex flex-1 overflow-hidden">
//         {/* Left Categories Column Bar */}
//         <div className="w-24 md:w-28 bg-white border-r overflow-y-auto flex-shrink-0 hide-scrollbar">
//           <div className="py-2">
//             {categories.map((category) => (
//               <button
//                 key={category.id}
//                 onClick={() => setSelectedCategoryId(category.id)} // ✨ FIX: Pass category.id
//                 className={`w-full px-2 py-4 flex flex-col items-center gap-2 transition-all border-b ${
//                   selectedCategoryId === category.id 
//                     ? 'bg-orange-50/70 border-l-4 border-l-orange-500 text-orange-700 font-bold' 
//                     : 'text-gray-500 hover:bg-gray-50/50'
//                 }`}
//               >
//                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border ${
//                   selectedCategoryId === category.id ? 'bg-white border-orange-200' : 'bg-gray-50'
//                 }`}>
//                   {category.icon || '🍽️'}
//                 </div>
//                 <span className="text-[10px] text-center font-bold tracking-tight leading-tight uppercase truncate max-w-full px-1">
//                   {category.name}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>
        
//         {/* Main Menu Management View Grid */}
//         <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4">
//           {filteredItems.length > 0 ? (
//             <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
//               {filteredItems.map(item => {
//                 const isAvailable = item.isAvailable;
//                 const isUpdating = updatingItems[item.id];

//                 return (
//                   <div 
//                     key={item.id} 
//                     className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all flex flex-col ${
//                       !isAvailable ? 'opacity-60 bg-gray-100/50 border-gray-200' : 'hover:shadow-md'
//                     }`}
//                   >
//                     <div className="relative h-28 w-full bg-gray-100">
//                       <img 
//                         src={item.image || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=300"} 
//                         alt={item.name} 
//                         className="w-full h-full object-cover" 
//                       />
//                       {!isAvailable && (
//                         <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
//                           <span className="text-white font-black bg-red-600 px-2.5 py-0.5 rounded-md text-[10px] tracking-wide uppercase border border-white/20 shadow">
//                             OUT OF STOCK
//                           </span>
//                         </div>
//                       )}
//                     </div>
                    
//                     <div className="p-3 flex flex-col flex-grow">
//                       <div className="flex-grow">
//                         <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 mb-1">
//                           {item.name}
//                         </h3>
//                         <div className="flex items-center gap-1 mb-2 text-[10px] font-bold text-green-600 bg-green-50 w-max px-1.5 py-0.5 rounded">
//                           <Star className="w-3 h-3 fill-green-600 text-green-600" />
//                           <span>{item.rating || "4.2"}</span>
//                         </div>
//                       </div>
                      
//                       <div className="mt-2">
//                         <p className="text-base font-black text-gray-900 mb-2">₹{item.price}</p>
                        
//                         <button
//                           onClick={() => handleToggleAvailability(item)}
//                           disabled={isUpdating}
//                           className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-colors shadow-sm ${
//                             isAvailable 
//                               ? 'bg-red-50 text-red-600 hover:bg-red-100/80 border border-red-200/30' 
//                               : 'bg-green-600 text-white hover:bg-green-700'
//                           } disabled:opacity-50`}
//                         >
//                           {isUpdating ? (
//                             <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full anonymity-spin animate-spin"></div>
//                           ) : isAvailable ? (
//                             <>
//                               <PackageX className="w-3.5 h-3.5 stroke-[2.5]" /> Disable Item
//                             </>
//                           ) : (
//                             <>
//                               <PackageCheck className="w-3.5 h-3.5 stroke-[2.5]" /> Activate Stock
//                             </>
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="text-center py-20 bg-white border rounded-2xl shadow-sm max-w-md mx-auto mt-10">
//               <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
//               <p className="text-sm font-bold text-gray-400">No menu items found in this section</p>
//             </div>
//           )}
//         </div>
//       </div>

//       <style>{`
//         .hide-scrollbar::-webkit-scrollbar { display: none; }
//         .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>
//     </div>
//   );
// }





"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Star, PackageCheck, PackageX, ClipboardList } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  rating: number | null;
  isAvailable: boolean;
  categoryId: string;
  category?: Category; // ✨ Added relational structure definition
}

export default function ManageMenuPage() {
  const router = useRouter();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const [authLoading, setAuthLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({});
  const [ownerUser, setOwnerUser] = useState<any>(null);

  // 1. Authorization Access Check Loop
  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (!cachedUser) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(cachedUser);
    if (parsedUser.role !== 'CANTEEN_ADMIN') {
      router.push('/dashboard'); 
      return;
    }

    setOwnerUser(parsedUser);
    setAuthLoading(false);
  }, [router]);

  // 2. Fetch Menu and Category Layout Fields from API Gateway
  useEffect(() => {
    if (!ownerUser) return;

    const activeCanteenId = ownerUser.canteenId || ownerUser.canteenID || "";
    if (!activeCanteenId) return;

    const fetchMenuData = async () => {
      try {
        // Fetch Menu categories layout models
        const catRes = await fetch(`/api/canteens/categories?canteenId=${activeCanteenId}`);
        const catData = await catRes.json();
        
        let fetchedCategories: Category[] = [];
        if (catData.success && catData.categories) {
          fetchedCategories = catData.categories;
          setCategories(fetchedCategories);
        }

        // Fetch Canteen Menu Items array with dynamic admin parameter flag
        const menuRes = await fetch(`/api/canteens/${activeCanteenId}/menu?all=true`);
        const menuData = await menuRes.json();
        
        if (menuData.success && menuData.menu) {
          setMenuItems(menuData.menu);
        }

        // Initialize default category selection safely
        if (fetchedCategories.length > 0) {
          setSelectedCategoryId(fetchedCategories[0].id);
        }
      } catch (error) {
        console.error("Error loading menu structural matrices:", error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchMenuData();
  }, [ownerUser]);

  if (authLoading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  // 3. Toggle Stock Value parameters via Backend Actions
  const handleToggleAvailability = async (item: MenuItem) => {
    const newStatus = !item.isAvailable;
    
    setUpdatingItems(prev => ({ ...prev, [item.id]: true }));

    try {
      const res = await fetch(`/api/canteens/${ownerUser.canteenId || ownerUser.canteenID}/menu/update-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItemId: item.id, isAvailable: newStatus })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMenuItems(prevItems =>
          prevItems.map(m => m.id === item.id ? { ...m, isAvailable: newStatus } : m)
        );
      } else {
        alert("Failed to update status: " + data.error);
      }
    } catch (error) {
      console.error("Error shifting stock flag settings:", error);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [item.id]: false }));
    }
  };

  // ✨ FIX: Robust conditional checking both flat property keys and joined object parameters
  const filteredItems = menuItems
  .filter(item => {
    // If a sidebar category is loaded and selected, filter by it strictly
    if (selectedCategoryId) {
      return item.categoryId === selectedCategoryId || item.category?.id === selectedCategoryId;
    }
    // 👇 If categories database array is broken or empty, fallback to displaying ALL elements!
    return true; 
  })
  .sort((a, b) => (a.isAvailable === b.isAvailable ? 0 : a.isAvailable ? -1 : 1));

  return (
    <div className="h-screen bg-gray-50 flex flex-col antialiased text-gray-900">
      {/* Header Container */}
      <header className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/canteen/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors border"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-base font-black text-gray-900">Manage Menu Stock</h1>
            <p className="text-[11px] text-orange-600 font-bold">Instantly enable/disable items for students</p>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Categories Sidebar */}
        <div className="w-24 md:w-28 bg-white border-r overflow-y-auto flex-shrink-0 hide-scrollbar">
          <div className="py-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`w-full px-2 py-4 flex flex-col items-center gap-2 transition-all border-b ${
                  selectedCategoryId === category.id 
                    ? 'bg-orange-50/70 border-l-4 border-l-orange-500 text-orange-700 font-bold' 
                    : 'text-gray-500 hover:bg-gray-50/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border ${
                  selectedCategoryId === category.id ? 'bg-white border-orange-200' : 'bg-gray-50'
                }`}>
                  {category.icon || '🍽️'}
                </div>
                <span className="text-[10px] text-center font-bold tracking-tight leading-tight uppercase truncate max-w-full px-1">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredItems.map(item => {
                const isAvailable = item.isAvailable;
                const isUpdating = updatingItems[item.id];

                return (
                  <div 
                    key={item.id} 
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all flex flex-col ${
                      !isAvailable ? 'opacity-60 bg-gray-100/50 border-gray-200' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="relative h-28 w-full bg-gray-100">
                      <Image 
                        src={item.image || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=300"} 
                        alt={item.name} 
                        fill
                        unoptimized
                        className="object-cover" 
                      />
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                          <span className="text-white font-black bg-red-600 px-2.5 py-0.5 rounded-md text-[10px] tracking-wide uppercase border border-white/20 shadow">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 flex flex-col flex-grow">
                      <div className="flex-grow">
                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 mb-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-2 text-[10px] font-bold text-green-600 bg-green-50 w-max px-1.5 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-green-600 text-green-600" />
                          <span>{item.rating || "4.2"}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-base font-black text-gray-900 mb-2">₹{item.price}</p>
                        
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          disabled={isUpdating}
                          className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-colors shadow-sm ${
                            isAvailable 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100/80 border border-red-200/30' 
                              : 'bg-green-600 text-white hover:bg-green-700'
                          } disabled:opacity-50`}
                        >
                          {isUpdating ? (
                            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full anonymity-spin animate-spin"></div>
                          ) : isAvailable ? (
                            <>
                              <PackageX className="w-3.5 h-3.5 stroke-[2.5]" /> Disable Item
                            </>
                          ) : (
                            <>
                              <PackageCheck className="w-3.5 h-3.5 stroke-[2.5]" /> Activate Stock
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border rounded-2xl shadow-sm max-w-md mx-auto mt-10">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-400">No menu items found in this section</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}