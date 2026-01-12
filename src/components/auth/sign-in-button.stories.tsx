/**
 * SignInButton Storybook Stories
 *
 * Demonstrates different states and variants of the SignInButton component.
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SignInButton } from './sign-in-button';

const meta: Meta<typeof SignInButton> = {
  title: 'Auth/SignInButton',
  component: SignInButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    callbackUrl: {
      control: 'text',
      description: 'URL to redirect to after sign-in',
    },
    variant: {
      control: 'select',
      options: ['default', 'outline', 'secondary', 'ghost', 'link'],
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
type Story = StoryObj<typeof SignInButton>;

/**
 * Default sign-in button with Google OAuth
 */
export const Default: Story = {
  args: {
    callbackUrl: '/dashboard',
  },
};

/**
 * Outlined variant for subtle emphasis
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    callbackUrl: '/dashboard',
  },
};

/**
 * Secondary variant for less emphasis
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    callbackUrl: '/dashboard',
  },
};

/**
 * Ghost variant for minimal styling
 */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    callbackUrl: '/dashboard',
  },
};

/**
 * Link variant for inline text
 */
export const Link: Story = {
  args: {
    variant: 'link',
    callbackUrl: '/dashboard',
  },
};

/**
 * Small size button
 */
export const Small: Story = {
  args: {
    size: 'sm',
    callbackUrl: '/dashboard',
  },
};

/**
 * Large size button
 */
export const Large: Story = {
  args: {
    size: 'lg',
    callbackUrl: '/dashboard',
  },
};

/**
 * Custom text content
 */
export const CustomText: Story = {
  args: {
    children: 'Login with Google Account',
    callbackUrl: '/dashboard',
  },
};

/**
 * Full width button
 */
export const FullWidth: Story = {
  args: {
    className: 'w-full',
    callbackUrl: '/dashboard',
  },
  parameters: {
    layout: 'padded',
  },
};
