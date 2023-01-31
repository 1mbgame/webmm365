import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'home-outline',
    link: '/pages/dashboard',
    home: true,
  },
  {
    title: 'Main',
    icon: 'layout-outline',
    children: [
      {
        title: 'Account',
        link: '/pages/mm365/account',
      },
      {
        title: 'Category',
        link: '/pages/mm365/category',
      },
      {
        title: 'Budget',
        link: '/pages/mm365/budget',
      },
    ],
  },
  {
    title: 'Chart',
    icon: 'pie-chart-outline',
    children: [
      {
        title: 'Category Chart',
        link: '/pages/mm365/category-chart',
      },
      // {
      //   title: 'Transaction Chart',
      //   link: '/pages/mm365/transaction-chart',
      // },
      {
        title: 'Chart Compare',
        link: '/pages/mm365/compare-chart',
      },
      {
        title: 'Budget Chart',
        link: '/pages/mm365/budget-chart',
      },
      
    ],
  },
  
  {
    title: 'Export / Import CSV',
    icon: 'browser-outline',
    link: '/pages/mm365',
    children: [
      {
        title: 'Export',
        link: '/pages/mm365/export',
      },
      {
        title: 'Import',
        link: '/pages/mm365/import',
      },
    ],
  },
  {
    title: 'Backup / Restore',
    icon: 'file-outline',
    children: [
      {
        title: 'Backup',
        link: '/pages/mm365/backup',
      },
      {
        title: 'Restore',
        link: '/pages/mm365/restore',
      },
    ],
  },
  // {
  //   title: 'VIP',
  //   icon: 'pricetags-outline',
  //   link: '/pages/mm365/vip'
  // },
 
  
];
