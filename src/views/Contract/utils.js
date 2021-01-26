export const reviewStatus = status => {
  if (!status) {
    return {
      label: 'Draft',
      variant: '',
    }
  }
  if (Number(status) === 1) {
    return {
      label: 'Direview',
      variant: 'primary',
    }
  }
  if (Number(status) === 2) {
    return {
      label: 'Disetuji',
      variant: 'success',
    }
  }
  if (Number(status) === 3) {
    return {
      label: 'Ditolak',
      variant: 'danger',
    }
  }

  return {
    label: 'Unknown',
    variant: 'danger',
  }
}
