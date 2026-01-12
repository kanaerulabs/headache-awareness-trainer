/**
 * UserAvatar Storybook Stories
 *
 * Demonstrates different states and variants of the UserAvatar component.
 */

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { UserAvatar } from './user-avatar';
import { User } from '@/domains/auth/entities/user.entity';

// Mock users for stories
const userWithImage = User.create({
  id: '1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  image: 'https://i.pravatar.cc/150?img=12',
});

const userWithoutImage = User.create({
  id: '2',
  email: 'jane.smith@example.com',
  name: 'Jane Smith',
});

const userSingleName = User.create({
  id: '3',
  email: 'alice@example.com',
  name: 'Alice',
});

const userLongName = User.create({
  id: '4',
  email: 'bob.johnson.williams@example.com',
  name: 'Bob Johnson Williams',
});

const meta: Meta<typeof UserAvatar> = {
  title: 'Auth/UserAvatar',
  component: UserAvatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Avatar size',
    },
    showBorder: {
      control: 'boolean',
      description: 'Show border around avatar',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

/**
 * Default avatar with profile image
 */
export const WithImage: Story = {
  args: {
    user: userWithImage,
    size: 'md',
  },
};

/**
 * Avatar with initials fallback (no image)
 */
export const WithInitials: Story = {
  args: {
    user: userWithoutImage,
    size: 'md',
  },
};

/**
 * Single name user (one initial)
 */
export const SingleName: Story = {
  args: {
    user: userSingleName,
    size: 'md',
  },
};

/**
 * Long name user (two initials from first two names)
 */
export const LongName: Story = {
  args: {
    user: userLongName,
    size: 'md',
  },
};

/**
 * Small size avatar
 */
export const Small: Story = {
  args: {
    user: userWithImage,
    size: 'sm',
  },
};

/**
 * Medium size avatar (default)
 */
export const Medium: Story = {
  args: {
    user: userWithImage,
    size: 'md',
  },
};

/**
 * Large size avatar
 */
export const Large: Story = {
  args: {
    user: userWithImage,
    size: 'lg',
  },
};

/**
 * Avatar with border
 */
export const WithBorder: Story = {
  args: {
    user: userWithImage,
    size: 'md',
    showBorder: true,
  },
};

/**
 * Initials with border
 */
export const InitialsWithBorder: Story = {
  args: {
    user: userWithoutImage,
    size: 'md',
    showBorder: true,
  },
};

/**
 * All sizes comparison
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <UserAvatar user={userWithImage} size="sm" />
      <UserAvatar user={userWithImage} size="md" />
      <UserAvatar user={userWithImage} size="lg" />
    </div>
  ),
};

/**
 * Image vs Initials comparison
 */
export const ImageVsInitials: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <UserAvatar user={userWithImage} size="md" showBorder />
      <UserAvatar user={userWithoutImage} size="md" showBorder />
    </div>
  ),
};
