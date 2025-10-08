import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../Button'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('should apply variant classes correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    let button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600')

    rerender(<Button variant="secondary">Secondary</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-200')

    rerender(<Button variant="danger">Danger</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-red-600')

    rerender(<Button variant="success">Success</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-green-600')
  })

  it('should apply size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    let button = screen.getByRole('button')
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')

    rerender(<Button size="md">Medium</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('px-4', 'py-2', 'text-sm')

    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('px-6', 'py-3', 'text-base')
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')

    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should show loading state', () => {
    render(<Button loading>Loading</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')

    // Check for loading spinner
    const spinner = button.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should render with icon', () => {
    const Icon = () => <svg data-testid="test-icon" />
    render(<Button icon={<Icon />}>With Icon</Button>)

    const icon = screen.getByTestId('test-icon')
    expect(icon).toBeInTheDocument()
  })

  it('should apply fullWidth class when fullWidth is true', () => {
    render(<Button fullWidth>Full Width</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('w-full')
  })

  it('should render as a different element when "as" prop is provided', () => {
    render(
      <Button as="a" href="/test">
        Link Button
      </Button>
    )

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should support type prop', () => {
    render(<Button type="submit">Submit</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})