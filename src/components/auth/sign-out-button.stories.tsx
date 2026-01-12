/**
 * SignOutButton Storybook Stories
 *
 * Demonstrates different states and variants of the SignOutButton component.
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SignOutButton } from './sign-out-button';

const meta: Meta<typeof SignOutButton> = {
  title: 'Auth/SignOutButton',
  component: SignOutButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    callbackUrl: {
      control: 'text',
      description: 'URL to redirect to after sign-out',
    },
    variant: {
      control: 'select',
      options: ['default', 'outline', 'secondary', 'ghost', 'link', 'destructive'],
      description: 'Button variant style',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Button size',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SignOutButton>;

/**
 * Default sign-out button (outline variant)
 */
export const Default: Story = {
  args: {
    callbackUrl: '/',
  },
};

/**
 * Primary variant for emphasis
 */
export const Primary: Story = {
  args: {
    variant: 'default',
    callbackUrl: '/',
  },
};

/**
 * Destructive variant to emphasize sign-out action
 */
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    callbackUrl: '/',
  },
};

/**
 * Ghost variant for minimal styling
 */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    callbackUrl: '/',
  },
};

/**
 * Link variant for inline text
 */
export const Link: Story = {
  args: {
    variant: 'link',
    callbackUrl: '/',
  },
};

/**
 * Small size button
 */
export const Small: Story = {
  args: {
    size: 'sm',
    callbackUrl: '/',
  },
};

/**
 * Large size button
 */
export const Large: Story = {
  args: {
    size: 'lg',
    callbackUrl: '/',
  },
};

/**
 * Custom text content
 */
export const CustomText: Story = {
  args: {
    children: 'Log Out',
    callbackUrl: '/',
  },
};
