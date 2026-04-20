import { useState, useRef, useEffect } from 'react';

interface Option {
  value: number;
  label: string;
}

interface Props {
  options: Option[];
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

function SearchableSelect({ options, value, onChange, placeholder = '선택', style }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setSearch('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (val: number) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearch('');
  };

  return (
    <div ref={containerRef} style={{ ...styles.container, ...style }}>
      <div style={styles.trigger} onClick={handleOpen}>
        <span style={selectedOption ? styles.selectedText : styles.placeholder}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {selectedOption && (
          <span style={styles.clearBtn} onClick={handleClear}>&times;</span>
        )}
        <span style={styles.arrow}>&#9662;</span>
      </div>

      {isOpen && (
        <div style={styles.dropdown}>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색..."
            style={styles.searchInput}
          />
          <div style={styles.optionList}>
            {filtered.length === 0 && (
              <div style={styles.noResult}>검색 결과 없음</div>
            )}
            {filtered.map((o) => (
              <div
                key={o.value}
                style={{
                  ...styles.option,
                  ...(o.value === value ? styles.optionSelected : {}),
                }}
                onClick={() => handleSelect(o.value)}
              >
                {o.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    minWidth: '200px',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    gap: '8px',
  },
  selectedText: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  placeholder: {
    flex: 1,
    color: '#999',
  },
  clearBtn: {
    color: '#999',
    fontSize: '16px',
    lineHeight: '1',
    cursor: 'pointer',
  },
  arrow: {
    color: '#999',
    fontSize: '10px',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    border: 'none',
    borderBottom: '1px solid #eee',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  optionList: {
    maxHeight: '200px',
    overflowY: 'auto',
  },
  option: {
    padding: '8px 12px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  optionSelected: {
    backgroundColor: '#e8f0fe',
    color: '#4a90d9',
  },
  noResult: {
    padding: '12px',
    fontSize: '13px',
    color: '#999',
    textAlign: 'center',
  },
};

export default SearchableSelect;
