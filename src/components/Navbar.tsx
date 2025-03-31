'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'next-auth';
import { Menu } from 'lucide-react';

function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as User | undefined;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="p-4 shadow-md bg-yellow-950 text-white">
      <div className="container mx-auto">
        {/* Desktop navbar */}
        <div className="hidden md:flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-amber-100">
            NO-FILTER
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <span className="text-amber-100">
                  Welcome, {user?.username || user?.email}
                </span>
                <Button 
                  onClick={() => signOut()} 
                  className="bg-amber-100 text-black hover:bg-amber-200" 
                  variant="outline"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/sign-in">
                <Button 
                  className="bg-amber-100 hover:bg-amber-200 text-black" 
                  variant="outline"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile navbar */}
        <div className="md:hidden flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-amber-100">
            NO-FILTER
          </Link>
          <Button 
            variant="ghost" 
            className="p-1 text-amber-100" 
            onClick={toggleMenu}
          >
            <Menu size={24} />
          </Button>
        </div>
        
        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-3 py-4 px-2 rounded bg-yellow-900">
            {session ? (
              <>
                <span className="text-amber-100 text-center">
                  Welcome, {user?.username || user?.email}
                </span>
                <Button 
                  onClick={() => signOut()} 
                  className="bg-amber-100 text-black hover:bg-amber-200 w-full" 
                  variant="outline"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/sign-in" className="w-full">
                <Button 
                  className="bg-amber-100 hover:bg-amber-200 text-black w-full" 
                  variant="outline"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;