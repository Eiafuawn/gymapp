// PaginationComponent for PlannerScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  theme 
}) => {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  // Determine which page numbers to show
  const getVisiblePageNumbers = () => {
    // For 5 or fewer pages, show all page numbers
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // For more than 5 pages, show a window around the current page
    let pages = [1]; // Always include first page
    
    // Determine the start and end of our visible window
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('...');
    }
    
    // Add the window of pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    // Always include last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePageNumbers();

  return (
    <View style={styles.pagination}>
      {/* Previous button */}
      <TouchableOpacity
        style={[
          styles.paginationButton,
          styles.navButton,
          currentPage === 1 && styles.disabledButton,
          { borderColor: theme.colors.border }
        ]}
        onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Ionicons 
          name="chevron-back" 
          size={18} 
          color={currentPage === 1 ? theme.colors.border : theme.colors.text} 
        />
      </TouchableOpacity>

      {/* Page numbers */}
      {visiblePages.map((page, index) => (
        <TouchableOpacity
          key={`page-${index}`}
          style={[
            styles.paginationButton,
            typeof page === 'number' && page === currentPage && {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary
            },
            typeof page !== 'number' && styles.ellipsis,
            { borderColor: theme.colors.border }
          ]}
          onPress={() => typeof page === 'number' && onPageChange(page)}
          disabled={typeof page !== 'number' || page === currentPage}
        >
          <Text
            style={[
              styles.paginationButtonText,
              { color: typeof page === 'number' && page === currentPage ? 'white' : theme.colors.text }
            ]}
          >
            {typeof page === 'number' ? page : '...'}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Next button */}
      <TouchableOpacity
        style={[
          styles.paginationButton,
          styles.navButton,
          currentPage === totalPages && styles.disabledButton,
          { borderColor: theme.colors.border }
        ]}
        onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Ionicons 
          name="chevron-forward" 
          size={18} 
          color={currentPage === totalPages ? theme.colors.border : theme.colors.text} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  paginationButton: {
    height: 36,
    minWidth: 36,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 12,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  ellipsis: {
    borderWidth: 0,
  }
});

export default Pagination;
