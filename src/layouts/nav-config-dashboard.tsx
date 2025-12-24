import type { RootState } from 'src/store';

import { useSelector } from 'react-redux';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const useNavData = (): NavItem[] => {
  const { products } = useSelector((state: RootState) => state.product);
  const { orders } = useSelector((state: RootState) => state.order);
  const { categories } = useSelector((state: RootState) => state.category);
  const { offers } = useSelector((state: RootState) => state.offer);
  const { policies } = useSelector((state: RootState) => state.policy);
  const { taxes } = useSelector((state: RootState) => state.tax);
  const { users } = useSelector((state: RootState) => state.users);

  // const productCount = products?.length || 0;
  // const orderCount = orders?.length || 0;
  // const categoryCount = categories?.length || 0;
  // const offerCount = offers?.length || 0;
  // const policyCount = policies?.length || 0;
  // const taxCount = taxes?.length || 0;
  // const adminCount = users?.length || 0;

  const { userDetails } = useSelector((state: RootState) => state.user);
  const isSuperAdmin = userDetails?.user?.role === 'super_admin';
  return [
    {
      title: 'Dashboard',
      path: '/',
      icon: icon('ic-analytics'),
    },
    {
      title: 'Products',
      path: '/products',
      icon: icon('ic-cart'),
    },
    {
      title: 'Orders',
      path: '/orders',
      icon: icon('ic-cart'),
    },
    {
      title: 'Categories',
      path: '/category',
      icon: icon('ic-cart'),
    },
    {
      title: 'Offers',
      path: '/offer',
      icon: icon('ic-cart'),
    },
    {
      title: 'Policies',
      path: '/policy',
      icon: icon('ic-cart'),
    },
    {
      title: 'Tax Management',
      path: '/tax',
      icon: icon('ic-cart'),
    },
    ...(isSuperAdmin
      ? [
          {
            title: 'Admins',
            path: '/admin',
            icon: icon('ic-user'),
          },
        ]
      : []),
    {
      title: 'Customers',
      path: '/customer',
      icon: icon('ic-user'),
    },
  ];
};

// Static nav data for initial render (fallback)
export const navData: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Products',
    path: '/products',
    icon: icon('ic-cart'),
  },
  {
    title: 'Orders',
    path: '/orders',
    icon: icon('ic-cart'),
  },
  {
    title: 'Categories',
    path: '/category',
    icon: icon('ic-cart'),
  },
  {
    title: 'Policies',
    path: '/policy',
    icon: icon('ic-cart'),
  },
  {
    title: 'Tax Management',
    path: '/tax',
    icon: icon('ic-cart'),
  },
  {
    title: 'Admins',
    path: '/admin',
    icon: icon('ic-user'),
  },
  {
    title: 'Customers',
    path: '/customer',
    icon: icon('ic-user'),
  },
];
