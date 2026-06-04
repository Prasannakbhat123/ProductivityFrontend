import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

type NotesSectionProps = {
  isDark: boolean;
};

export function NotesSection({ isDark }: NotesSectionProps) {
  const queryClient = useQueryClient();
  const editorRef = useRef<HTMLDivElement | null>(null);

  const notebooksQuery = useQuery({ queryKey: ['notebooks'], queryFn: api.getNotebooks });
  const notebooks = notebooksQuery.data ?? [];

  const [selectedId, setSelectedId] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [fontSize, setFontSize] = useState('3');
  const [fontColor, setFontColor] = useState('#111111');

  const selectedNotebook = useMemo(
    () => notebooks.find((notebook) => notebook._id === selectedId) ?? notebooks[0],
    [notebooks, selectedId],
  );

  useEffect(() => {
    if (!selectedNotebook) return;
    if (editorRef.current && editorRef.current.innerHTML !== selectedNotebook.contentHtml) {
      editorRef.current.innerHTML = selectedNotebook.contentHtml || '';
    }
    setSelectedId(selectedNotebook._id);
  }, [selectedNotebook]);

  const createNotebookMutation = useMutation({
    mutationFn: () =>
      api.addNotebook({
        title: newTitle.trim(),
        imageUrl: newImageUrl.trim(),
        contentHtml: '',
      }),
    onSuccess: (created) => {
      setNewTitle('');
      setNewImageUrl('');
      setSelectedId(created._id);
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    },
  });

  const saveNotebookMutation = useMutation({
    mutationFn: (payload: { id: string; contentHtml: string }) =>
      api.updateNotebook(payload.id, { contentHtml: payload.contentHtml }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notebooks'] }),
  });

  const deleteNotebookMutation = useMutation({
    mutationFn: (id: string) => api.deleteNotebook(id),
    onSuccess: () => {
      setSelectedId('');
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    },
  });

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  };

  return (
    <section className="space-y-4">
      <article className={`rounded-2xl border p-4 sm:p-5 shadow-xl ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-300 bg-white'}`}>
        <h2 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Notebooks</h2>
        <p className={`mt-1 text-xs sm:text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Create multiple notebooks with cover image and rich text content.</p>

        <div className="mt-4 flex flex-col gap-2 sm:grid sm:gap-3 sm:grid-cols-[1.4fr_1fr_auto]">
          <input
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Notebook title"
            className={`rounded-xl border px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-300' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`}
          />
          <input
            value={newImageUrl}
            onChange={(event) => setNewImageUrl(event.target.value)}
            placeholder="Image URL (optional)"
            className={`rounded-xl border px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-300' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`}
          />
          <button
            type="button"
            onClick={() => {
              if (!newTitle.trim()) return;
              createNotebookMutation.mutate();
            }}
            disabled={createNotebookMutation.isPending}
            className="rounded-xl bg-lime-300 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-950 transition hover:bg-lime-200 disabled:opacity-60"
          >
            {createNotebookMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </article>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[320px_1fr]">
        <article className={`rounded-2xl border p-4 sm:p-5 shadow-xl ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-300 bg-white'}`}>
          <h3 className={`mb-3 text-xs sm:text-sm font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Notebook Cards</h3>
          <div className="grid gap-3">
            {notebooks.map((notebook) => {
              const isSelected = selectedNotebook?._id === notebook._id;
              return (
                <button
                  key={notebook._id}
                  type="button"
                  onClick={() => setSelectedId(notebook._id)}
                  className={`overflow-hidden rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-lime-300 ring-1 ring-lime-300'
                      : isDark
                        ? 'border-zinc-700 hover:border-zinc-500'
                        : 'border-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  <div
                    className="h-24 w-full bg-cover bg-center"
                    style={{
                      backgroundImage: notebook.imageUrl
                        ? `url(${notebook.imageUrl})`
                        : 'linear-gradient(135deg,#d6b4fc,#f9a8d4)',
                    }}
                  />
                  <div className="p-3">
                    <p className={`truncate text-sm font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{notebook.title}</p>
                    <p className={`mt-1 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Updated {new Date(notebook.updatedAt).toLocaleDateString('en-GB')}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        <article className={`rounded-2xl border p-4 sm:p-5 shadow-xl ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-300 bg-white'}`}>
          {selectedNotebook ? (
            <>
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{selectedNotebook.title}</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => deleteNotebookMutation.mutate(selectedNotebook._id)}
                    className={`rounded-lg border px-3 py-1 text-xs ${isDark ? 'border-red-900 bg-red-950/40 text-red-300 hover:bg-red-950/70' : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'}`}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const contentHtml = editorRef.current?.innerHTML ?? '';
                      saveNotebookMutation.mutate({ id: selectedNotebook._id, contentHtml });
                    }}
                    className="rounded-lg bg-lime-300 px-3 py-1 text-xs font-semibold text-zinc-950 hover:bg-lime-200"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className={`mb-3 flex flex-wrap items-center gap-2 rounded-xl border p-2 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'}`}>
                <button type="button" onClick={() => runCommand('bold')} className="rounded-md border border-zinc-400 px-2 py-1 text-xs">B</button>
                <button type="button" onClick={() => runCommand('italic')} className="rounded-md border border-zinc-400 px-2 py-1 text-xs italic">I</button>
                <button type="button" onClick={() => runCommand('underline')} className="rounded-md border border-zinc-400 px-2 py-1 text-xs underline">U</button>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(event) => {
                    setFontColor(event.target.value);
                    runCommand('foreColor', event.target.value);
                  }}
                  className="h-8 w-10 rounded border border-zinc-400"
                />
                <select
                  value={fontSize}
                  onChange={(event) => {
                    setFontSize(event.target.value);
                    runCommand('fontSize', event.target.value);
                  }}
                  className={`rounded-md border px-2 py-1 text-xs ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900'}`}
                >
                  <option value="2">Small</option>
                  <option value="3">Normal</option>
                  <option value="4">Large</option>
                  <option value="5">XL</option>
                </select>
                <button type="button" onClick={() => runCommand('insertUnorderedList')} className="rounded-md border border-zinc-400 px-2 py-1 text-xs">Bullet</button>
                <button type="button" onClick={() => runCommand('formatBlock', 'h2')} className="rounded-md border border-zinc-400 px-2 py-1 text-xs">H2</button>
              </div>

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className={`min-h-80 rounded-xl border p-3 text-sm outline-none ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900'}`}
              />
            </>
          ) : (
            <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Create a notebook to start writing.</p>
          )}
        </article>
      </div>
    </section>
  );
}
