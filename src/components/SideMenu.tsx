import React from 'react'

import { HomeIcon, ChipIcon } from '@heroicons/react/outline'
import Link from 'next/link'

function Header({ title }: { title?: string }) {
  const headerHeight = '72px'

  return (
    <div
      className="flex lg:space-x-3 justify-center lg:justify-start lg:px-3 border-b border-gray-900 items-center"
      style={{ height: headerHeight }}
    >
      <ChipIcon className="w-12 h-12 lg:w-10 lg:h-10 text-indigo-500" />
      <h2 className="text-white text-2xl font-semibold hidden lg:inline">
        {title}
      </h2>
    </div>
  )
}

function MenuItem({
  title,
  to,
  children,
}: {
  title: string
  to: string
  children: React.ReactNode
}) {
  let activeClass =
    ' text-gray-400 lg:rounded-md hover:text-white hover:bg-gray-700'
  const active = 1

  if (active) {
    activeClass = ' lg:rounded-md text-white bg-gray-900'
  }

  return (
    <Link href={to} passHref legacyBehavior>
      <a
        className={
          'lg:mx-2 py-4 lg:py-2 lg:px-3 flex justify-center lg:justify-start space-x-4 items-center truncate ' +
          activeClass
        }
      >
        {children}
        <span className="hidden lg:inline">{title}</span>
      </a>
    </Link>
  )
}

const SideMenu = () => {
  const itemIconClass = 'w-8 h-8 lg:w-5 lg:h-5'

  return (
    <div className="bg-gray-800 overflow-y-auto h-screen">
      <Header title="Loco" />
      <ul className="lg:mt-2 lg:space-y-2">
        <MenuItem to="/" title="Home">
          <HomeIcon className={itemIconClass} />
        </MenuItem>
        {/* <MenuItem to="/forms" title="Forms">
          <DocumentTextIcon className={itemIconClass} />
        </MenuItem>
        <MenuItem to="/tables" title="Tables">
          <TableIcon className={itemIconClass} />
        </MenuItem> */}

        <div>
          <span className="my-3 lg:my-5 border-b border-gray-900 block"></span>
        </div>
        {/* <MenuItem to="/" title="Settings">
          <CogIcon className={itemIconClass} />
        </MenuItem> */}
      </ul>
    </div>
  )
}

export default SideMenu
