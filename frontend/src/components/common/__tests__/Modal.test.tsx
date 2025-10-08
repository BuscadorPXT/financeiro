import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Modal from '../Modal'

describe('Modal Component', () => {
  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when clicking outside the modal', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    // Click on the backdrop
    const backdrop = screen.getByTestId('modal-backdrop')
    fireEvent.click(backdrop)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should not close when clicking inside the modal content', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    // Click inside modal content
    const modalContent = screen.getByText('Modal content')
    fireEvent.click(modalContent)

    expect(handleClose).not.toHaveBeenCalled()
  })

  it('should close on Escape key press', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should apply different sizes', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()} size="sm">
        Content
      </Modal>
    )

    let modalContent = screen.getByTestId('modal-content')
    expect(modalContent).toHaveClass('max-w-md')

    rerender(
      <Modal isOpen={true} onClose={vi.fn()} size="lg">
        Content
      </Modal>
    )

    modalContent = screen.getByTestId('modal-content')
    expect(modalContent).toHaveClass('max-w-4xl')

    rerender(
      <Modal isOpen={true} onClose={vi.fn()} size="xl">
        Content
      </Modal>
    )

    modalContent = screen.getByTestId('modal-content')
    expect(modalContent).toHaveClass('max-w-6xl')
  })

  it('should render footer actions', () => {
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()

    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Confirm Modal"
        footer={
          <>
            <button onClick={handleCancel}>Cancel</button>
            <button onClick={handleConfirm}>Confirm</button>
          </>
        }
      >
        <p>Are you sure?</p>
      </Modal>
    )

    const cancelButton = screen.getByText('Cancel')
    const confirmButton = screen.getByText('Confirm')

    expect(cancelButton).toBeInTheDocument()
    expect(confirmButton).toBeInTheDocument()

    fireEvent.click(confirmButton)
    expect(handleConfirm).toHaveBeenCalledTimes(1)

    fireEvent.click(cancelButton)
    expect(handleCancel).toHaveBeenCalledTimes(1)
  })

  it('should prevent closing when closeOnEscape is false', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnEscape={false}>
        <p>Modal content</p>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    expect(handleClose).not.toHaveBeenCalled()
  })

  it('should prevent closing when closeOnBackdrop is false', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnBackdrop={false}>
        <p>Modal content</p>
      </Modal>
    )

    const backdrop = screen.getByTestId('modal-backdrop')
    fireEvent.click(backdrop)

    expect(handleClose).not.toHaveBeenCalled()
  })

  it('should add and remove body scroll lock', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        Content
      </Modal>
    )

    // Check if overflow is hidden when modal is open
    expect(document.body.style.overflow).toBe('hidden')

    // Unmount and check if overflow is restored
    unmount()
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('should handle animation classes', async () => {
    const { rerender } = render(
      <Modal isOpen={false} onClose={vi.fn()}>
        Content
      </Modal>
    )

    // Open modal
    rerender(
      <Modal isOpen={true} onClose={vi.fn()}>
        Content
      </Modal>
    )

    const modalContent = screen.getByTestId('modal-content')

    // Check for animation classes
    await waitFor(() => {
      expect(modalContent).toHaveClass('animate-in')
    })
  })

  it('should render custom header', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        header={
          <div className="custom-header">
            <h2>Custom Title</h2>
            <span>Subtitle</span>
          </div>
        }
      >
        Content
      </Modal>
    )

    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Subtitle')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        className="custom-modal"
      >
        Content
      </Modal>
    )

    const modalContent = screen.getByTestId('modal-content')
    expect(modalContent).toHaveClass('custom-modal')
  })

  it('should focus trap within modal', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <input type="text" placeholder="First input" />
        <button>Action Button</button>
        <input type="text" placeholder="Last input" />
      </Modal>
    )

    const firstInput = screen.getByPlaceholderText('First input')
    const lastInput = screen.getByPlaceholderText('Last input')
    const actionButton = screen.getByText('Action Button')

    // Focus should be trapped within the modal
    firstInput.focus()
    expect(document.activeElement).toBe(firstInput)

    // Tab to next element
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' })
    expect(document.activeElement).toBe(actionButton)
  })

  it('should render loading state', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} loading>
        <p>Content</p>
      </Modal>
    )

    expect(screen.getByTestId('modal-loading')).toBeInTheDocument()
    // Content should be hidden or dimmed when loading
    const content = screen.getByText('Content')
    expect(content.parentElement).toHaveClass('opacity-50')
  })
})