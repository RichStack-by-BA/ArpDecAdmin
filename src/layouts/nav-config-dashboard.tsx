import type { RootState } from 'src/store';

import { useSelector } from 'react-redux';

import { Label } from 'src/components/label';
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
      // info: productCount > 0 ? (
      //   <Label color="error" variant="inverted">
      //     +{productCount}
      //   </Label>
      // ) : undefined,
    },
    {
      title: 'Orders',
      path: '/orders',
      icon: icon('ic-cart'),
      // info: orderCount > 0 ? (
      //   <Label color="info" variant="inverted">
      //     {orderCount}
      //   </Label>
      // ) : undefined,
    },
    {
      title: 'Categories',
      path: '/category',
      icon: icon('ic-cart'),
      // info: categoryCount > 0 ? (
      //   <Label color="error" variant="inverted">
      //     +{categoryCount}
      //   </Label>
      // ) : undefined,
    },
    {
      title: 'Offers',
      path: '/offer',
      icon: icon('ic-cart'),
      // info: offerCount > 0 ? (
      //   <Label color="success" variant="inverted">
      //     {offerCount}
      //   </Label>
      // ) : undefined,
    },
    {
      title: 'Policies',
      path: '/policy',
      icon: icon('ic-cart'),
      // info: policyCount > 0 ? (
      //   <Label color="info" variant="inverted">
      //     {policyCount}
      //   </Label>
      // ) : undefined,
    },
    {
      title: 'Tax Management',
      path: '/tax',
      icon: icon('ic-cart'),
      // info: taxCount > 0 ? (
      //   <Label color="warning" variant="inverted">
      //     {taxCount}
      //   </Label>
      // ) : undefined,
    },
    {
      title: 'Admins',
      path: '/admin',
      icon: icon('ic-user'),
      // info: adminCount > 0 ? (
      //   <Label color="success" variant="inverted">
      //     {adminCount}
      //   </Label>
      // ) : undefined,
    },
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
