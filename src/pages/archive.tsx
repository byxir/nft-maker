/* eslint-disable @next/next/no-img-element */
/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  MenuIcon,
  XIcon,
  ArchiveIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
} from '@heroicons/react/outline'
import Link from 'next/link'
import NetworkDropdown from '../components/index/NetworkDropdown'
import AddLayerSlideover from '../components/index/AddLayerSlideover'
import ConfigurationBar from '../components/index/ConfigurationBar'
import DisplayDataBar from '../components/index/DisplayDataBar'
import CollectionViewBar from '../components/archive/CollectionViewBar'
import CollectionsBar from '../components/archive/CollectionsBar'

const user = {
  name: 'Emily Selman',
  email: 'emily.selman@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}
const navigation = [
  { name: 'create', href: '/', icon: PlusIcon },
  { name: 'my archive', href: '/archive', icon: ArchiveIcon },
  { name: 'help', href: '/help', icon: QuestionMarkCircleIcon },
]

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <div className='flex h-full'>
        <Transition.Root show={mobileMenuOpen} as={Fragment}>
          <Dialog
            as='div'
            className='relative z-40 lg:hidden'
            onClose={setMobileMenuOpen}>
            <Transition.Child
              as={Fragment}
              enter='transition-opacity ease-linear duration-300'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='transition-opacity ease-linear duration-300'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'>
              <div className='fixed inset-0 bg-opacity-50 bg-background' />
            </Transition.Child>

            <div className='fixed inset-0 z-40 flex'>
              <Transition.Child
                as={Fragment}
                enter='transition ease-in-out duration-300 transform'
                enterFrom='-translate-x-full'
                enterTo='translate-x-0'
                leave='transition ease-in-out duration-300 transform'
                leaveFrom='translate-x-0'
                leaveTo='-translate-x-full'>
                <Dialog.Panel className='relative flex flex-col flex-1 w-full max-w-xs border-r bg-background border-accent2'>
                  <Transition.Child
                    as={Fragment}
                    enter='ease-in-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in-out duration-300'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'>
                    <div className='absolute top-0 right-0 pt-4 -mr-12'>
                      <button
                        type='button'
                        className='flex items-center justify-center w-10 h-10 ml-1'
                        onClick={() => setMobileMenuOpen(false)}>
                        <span className='sr-only'>Close sidebar</span>
                        <XIcon
                          className='w-6 h-6 text-white'
                          aria-hidden='true'
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className='pt-5 pb-4'>
                    <Link href='/'>
                      <div className='flex items-center flex-shrink-0 px-4 cursor-pointer'>
                        <img
                          className='w-auto h-8'
                          src='../../ape.png'
                          alt='Workflow'
                        />
                      </div>
                    </Link>
                    <nav aria-label='Sidebar' className='mt-5'>
                      <div className='px-2 space-y-1'>
                        {navigation.map((item) => (
                          <Link href={item.href} key={item.name}>
                            <p className='flex items-center p-2 text-base font-medium text-gray-300 rounded-md cursor-pointer group hover:bg-accent2'>
                              <item.icon
                                className='w-6 h-6 mr-4 text-gray-400 group-hover:text-gray-400'
                                aria-hidden='true'
                              />
                              {item.name}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </nav>
                  </div>
                  <div className='flex flex-shrink-0 p-4 border-t border-accent2'>
                    <Link className='flex-shrink-0 block group' href='/'>
                      <div className='flex items-center'>
                        <div>
                          <img
                            className='inline-block w-10 h-10 rounded-full'
                            src={user.imageUrl}
                            alt=''
                          />
                        </div>
                        <div className='ml-3'>
                          <p className='text-base font-medium text-gray-700 group-hover:text-gray-900'>
                            {user.name}
                          </p>
                          <p className='text-sm font-medium text-gray-500 group-hover:text-gray-700'>
                            Account Settings
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className='flex-shrink-0 w-14' aria-hidden='true'>
                {/* Force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className='hidden lg:flex lg:flex-shrink-0'>
          <div className='flex flex-col w-20'>
            <div className='flex flex-col flex-1 min-h-0 overflow-y-auto border-r bg-background border-accent2'>
              <div className='flex-1'>
                <Link href='/'>
                  <div className='flex items-center justify-center py-4 cursor-pointer bg-accent1'>
                    <img
                      className='w-auto h-8'
                      src='../../ape.png'
                      alt='Workflow'
                    />
                  </div>
                </Link>
                <nav
                  aria-label='Sidebar'
                  className='flex flex-col items-center py-6 space-y-3'>
                  {navigation.map((item) => (
                    <Link href={item.href} key={item.name}>
                      <div className='flex items-center p-4 text-gray-300 rounded-lg cursor-pointer hover:bg-accent2'>
                        <item.icon className='w-6 h-6' aria-hidden='true' />
                        <span className='sr-only'>{item.name}</span>
                      </div>
                    </Link>
                  ))}
                </nav>
              </div>
              <div className='flex flex-shrink-0 pb-5'>
                <Link href='#'>
                  <div className='flex-shrink-0 w-full cursor-pointer'>
                    <img
                      className='block w-10 h-10 mx-auto rounded-full'
                      src={user.imageUrl}
                      alt=''
                    />
                    <div className='sr-only'>
                      <p>{user.name}</p>
                      <p>Account settings</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col flex-1 min-w-0 overflow-hidden'>
          {/* Mobile top navigation */}
          <div className='lg:hidden'>
            <div className='flex items-center justify-between px-4 py-2 bg-background sm:px-6 lg:px-8'>
              <Link href='/'>
                <div className='cursor-pointer'>
                  <img
                    className='w-auto h-8'
                    src='../../ape.png'
                    alt='Workflow'
                  />
                </div>
              </Link>
              <div>
                <button
                  type='button'
                  className='inline-flex items-center justify-center w-12 h-12 -mr-3 text-white rounded-md bg-background hover:bg-accent1'
                  onClick={() => setMobileMenuOpen(true)}>
                  <span className='sr-only'>Open sidebar</span>
                  <MenuIcon className='w-6 h-6' aria-hidden='true' />
                </button>
              </div>
            </div>
          </div>

          <main className='flex flex-1 overflow-hidden'>
            {/* Primary column */}
            <section
              aria-labelledby='primary-heading'
              className='flex flex-col flex-1 h-full min-w-0 overflow-y-auto lg:order-last'>
              <CollectionViewBar />
              {/* Your content */}
            </section>

            {/* Secondary column (hidden on smaller screens) */}
            <aside className='hidden lg:block lg:flex-shrink-0 lg:order-first'>
              <div className='relative flex flex-col h-full p-8 overflow-y-auto border-r w-96 border-accent2'>
                <CollectionsBar />
              </div>
            </aside>
          </main>
        </div>
      </div>
    </>
  )
}
