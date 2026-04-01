import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Checkbox } from './components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { LogOut, Plus, Pencil, Trash2, CheckCircle2, ListTodo, Moon, Sun } from 'lucide-react';

type Language = 'en' | 'ru';
type ThemeMode = 'light' | 'dark';

type Task = {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed';
  createdAt: string;
};

type AppState = {
  isAuthenticated: boolean;
  currentUser: { email: string } | null;
  tasks: Task[];
  language: Language;
  theme: ThemeMode;
};

const STORAGE_KEY = 'taskboard-demo-v2';
const VALID_USER = {
  email: 'qa@example.com',
  password: 'Password123',
};

const initialSeed: AppState = {
  isAuthenticated: false,
  currentUser: null,
  language: 'en',
  theme: 'light',
  tasks: [
    {
      id: 1,
      title: 'Prepare smoke test checklist',
      description: 'Cover login, create, edit, delete, and filter flows.',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Verify API contracts',
      description: 'Check login and task response structure.',
      status: 'completed',
      createdAt: new Date().toISOString(),
    },
  ],
};

const translations = {
  en: {
    appName: 'TaskBoard',
    heroSubtitle: 'Demo app for Cypress + TypeScript + manual QA practice',
    heroIntro: 'Use this app to practice end-to-end testing for:',
    loginLogout: 'Login / Logout',
    taskCrud: 'Task CRUD',
    validation: 'Validation',
    filtering: 'Filtering',
    validCredentials: 'Valid credentials',
    resetDemoData: 'Reset demo data',
    signIn: 'Sign in',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    invalidCredentials: 'Invalid email or password',
    welcome: 'Welcome,',
    active: 'Active',
    completed: 'Completed',
    logout: 'Logout',
    testUtility: 'Test utility',
    resetUtility: 'Reset application to clean seed data',
    reset: 'Reset',
    editTask: 'Edit task',
    createTask: 'Create task',
    title: 'Title',
    description: 'Description',
    enterTaskTitle: 'Enter task title',
    optionalDescription: 'Optional description',
    taskTitleRequired: 'Task title is required',
    saveChanges: 'Save changes',
    addTask: 'Add task',
    cancel: 'Cancel',
    tasks: 'Tasks',
    all: 'All',
    noTasksFound: 'No tasks found for this filter.',
    noDescription: 'No description',
    edit: 'Edit',
    delete: 'Delete',
    suggestedCoverage: 'Suggested automation coverage',
    suggestedCoverageDesc: 'Login, validation, create/edit/delete, status change, filter behavior, persistence after refresh.',
    stableSelectors: 'Stable selectors included with',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    english: 'English',
    russian: 'Russian',
  },
  ru: {
    appName: 'TaskBoard',
    heroSubtitle: 'Демо-приложение для практики Cypress + TypeScript + manual QA',
    heroIntro: 'Используйте это приложение для практики end-to-end тестирования:',
    loginLogout: 'Вход / Выход',
    taskCrud: 'CRUD задач',
    validation: 'Валидация',
    filtering: 'Фильтрация',
    validCredentials: 'Корректные учетные данные',
    resetDemoData: 'Сбросить демо-данные',
    signIn: 'Войти',
    email: 'Email',
    password: 'Пароль',
    login: 'Войти',
    invalidCredentials: 'Неверный email или пароль',
    welcome: 'Добро пожаловать,',
    active: 'Активные',
    completed: 'Завершённые',
    logout: 'Выйти',
    testUtility: 'Тестовая утилита',
    resetUtility: 'Сбросить приложение к чистым демо-данным',
    reset: 'Сброс',
    editTask: 'Редактировать задачу',
    createTask: 'Создать задачу',
    title: 'Заголовок',
    description: 'Описание',
    enterTaskTitle: 'Введите заголовок задачи',
    optionalDescription: 'Необязательное описание',
    taskTitleRequired: 'Заголовок задачи обязателен',
    saveChanges: 'Сохранить изменения',
    addTask: 'Добавить задачу',
    cancel: 'Отмена',
    tasks: 'Задачи',
    all: 'Все',
    noTasksFound: 'Для этого фильтра задачи не найдены.',
    noDescription: 'Без описания',
    edit: 'Редактировать',
    delete: 'Удалить',
    suggestedCoverage: 'Рекомендуемое покрытие автоматизации',
    suggestedCoverageDesc: 'Вход, валидация, создание/редактирование/удаление, смена статуса, фильтры, сохранение после обновления страницы.',
    stableSelectors: 'Стабильные селекторы добавлены через',
    language: 'Язык',
    theme: 'Тема',
    light: 'Светлая',
    dark: 'Тёмная',
    english: 'Английский',
    russian: 'Русский',
  },
} as const;

function readState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppState) : initialSeed;
  } catch {
    return initialSeed;
  }
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function TaskBoardTestApp() {
  const [appState, setAppState] = useState<AppState>(() => readState());
  const [email, setEmail] = useState('qa@example.com');
  const [password, setPassword] = useState('Password123');
  const [loginError, setLoginError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const t = translations[appState.language];
  const isDark = appState.theme === 'dark';

  useEffect(() => {
    saveState(appState);
    document.documentElement.classList.toggle('dark', isDark);
  }, [appState, isDark]);

  const filteredTasks = useMemo(() => {
    if (filter === 'active') return appState.tasks.filter((t) => t.status === 'active');
    if (filter === 'completed') return appState.tasks.filter((t) => t.status === 'completed');
    return appState.tasks;
  }, [appState.tasks, filter]);

  const activeCount = appState.tasks.filter((t) => t.status === 'active').length;
  const completedCount = appState.tasks.filter((t) => t.status === 'completed').length;

  function setLanguage(language: Language) {
    setAppState((prev) => ({ ...prev, language }));
    setLoginError('');
    setFormError('');
  }

  function toggleTheme() {
    setAppState((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  }

  function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email === VALID_USER.email && password === VALID_USER.password) {
      setAppState((prev) => ({
        ...prev,
        isAuthenticated: true,
        currentUser: { email },
      }));
      setLoginError('');
      return;
    }
    setLoginError(t.invalidCredentials);
  }

  function logout() {
    setAppState((prev) => ({
      ...prev,
      isAuthenticated: false,
      currentUser: null,
    }));
    setEditingId(null);
    setTitle('');
    setDescription('');
    setFormError('');
  }

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setFormError('');
  }

  function submitTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setFormError(t.taskTitleRequired);
      return;
    }

    if (editingId !== null) {
      setAppState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === editingId
            ? { ...task, title: trimmedTitle, description: description.trim() }
            : task
        ),
      }));
      resetForm();
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      title: trimmedTitle,
      description: description.trim(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setAppState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    resetForm();
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setFormError('');
  }

  function deleteTask(id: number) {
    setAppState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
    if (editingId === id) resetForm();
  }

  function toggleComplete(id: number) {
    setAppState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id
          ? { ...task, status: task.status === 'completed' ? 'active' : 'completed' }
          : task
      ),
    }));
  }

  function resetDemoData() {
    localStorage.removeItem(STORAGE_KEY);
    setAppState(initialSeed);
    setFilter('all');
    setEmail(VALID_USER.email);
    setPassword(VALID_USER.password);
    setLoginError('');
    resetForm();
  }

  const shellClass = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardClass = isDark ? 'bg-slate-900 text-slate-100' : 'bg-white';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const softPanelClass = isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100';
  const taskCardClass = isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white';

  if (!appState.isAuthenticated) {
    return (
      <div className={`min-h-screen p-6 transition-colors md:p-10 ${shellClass}`}>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <Card className={`rounded-3xl border-0 shadow-lg ${cardClass}`}>
            <CardHeader>
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-2xl bg-slate-900 p-3 text-white dark:bg-slate-700">
                  <ListTodo className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-3xl">{t.appName}</CardTitle>
                  <p className={`text-sm ${mutedClass}`}>{t.heroSubtitle}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex flex-col gap-4 rounded-2xl border p-4 dark:border-slate-800">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className={`text-sm ${mutedClass}`}>{t.language}</p>
                    <div className="mt-2 flex gap-2">
                      <Button data-testid="lang-en" variant={appState.language === 'en' ? 'default' : 'outline'} className="rounded-2xl" onClick={() => setLanguage('en')}>{t.english}</Button>
                      <Button data-testid="lang-ru" variant={appState.language === 'ru' ? 'default' : 'outline'} className="rounded-2xl" onClick={() => setLanguage('ru')}>{t.russian}</Button>
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm ${mutedClass}`}>{t.theme}</p>
                    <Button data-testid="theme-toggle" variant="outline" className="mt-2 rounded-2xl" onClick={toggleTheme}>
                      {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                      {isDark ? t.light : t.dark}
                    </Button>
                  </div>
                </div>
              </div>
              <p>{t.heroIntro}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Badge variant="secondary" className="justify-center rounded-xl py-2">{t.loginLogout}</Badge>
                <Badge variant="secondary" className="justify-center rounded-xl py-2">{t.taskCrud}</Badge>
                <Badge variant="secondary" className="justify-center rounded-xl py-2">{t.validation}</Badge>
                <Badge variant="secondary" className="justify-center rounded-xl py-2">{t.filtering}</Badge>
              </div>
              <div className={`rounded-2xl p-4 ${softPanelClass}`}>
                <p className="font-medium">{t.validCredentials}</p>
                <p data-testid="demo-credentials-email">Email: {VALID_USER.email}</p>
                <p data-testid="demo-credentials-password">Password: {VALID_USER.password}</p>
              </div>
              <Button data-testid="reset-demo-data" variant="outline" onClick={resetDemoData}>{t.resetDemoData}</Button>
            </CardContent>
          </Card>

          <Card className={`rounded-3xl border-0 shadow-lg ${cardClass}`}>
            <CardHeader>
              <CardTitle className="text-2xl">{t.signIn}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={login} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.email}</label>
                  <Input
                    data-testid="login-email"
                    type="email"
                    value={email}
                    onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setEmail(e.target.value)}
                    placeholder="qa@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.password}</label>
                  <Input
                    data-testid="login-password"
                    type="password"
                    value={password}
                    onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setPassword(e.target.value)}
                    placeholder="Password123"
                  />
                </div>
                {loginError ? (
                  <div data-testid="login-error" className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {loginError}
                  </div>
                ) : null}
                <Button data-testid="login-submit" className="w-full rounded-2xl">{t.login}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-colors md:p-10 ${shellClass}`}>
      <div className="mx-auto max-w-6xl space-y-6">
        <Card className={`rounded-3xl border-0 shadow-lg ${cardClass}`}>
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className={`text-sm ${mutedClass}`}>{t.language}</p>
                <div className="mt-2 flex gap-2">
                  <Button data-testid="lang-en" variant={appState.language === 'en' ? 'default' : 'outline'} className="rounded-2xl" onClick={() => setLanguage('en')}>{t.english}</Button>
                  <Button data-testid="lang-ru" variant={appState.language === 'ru' ? 'default' : 'outline'} className="rounded-2xl" onClick={() => setLanguage('ru')}>{t.russian}</Button>
                </div>
              </div>
              <div>
                <p className={`text-sm ${mutedClass}`}>{t.theme}</p>
                <Button data-testid="theme-toggle" variant="outline" className="mt-2 rounded-2xl" onClick={toggleTheme}>
                  {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  {isDark ? t.light : t.dark}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <Card className={`rounded-3xl border-0 shadow-lg ${cardClass}`}>
            <CardContent className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
              <div>
                <h1 className="text-3xl font-bold">{t.appName}</h1>
                <p className={mutedClass}>{t.welcome} <span data-testid="current-user">{appState.currentUser?.email}</span></p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge data-testid="active-count" className="rounded-xl px-3 py-2">{t.active}: {activeCount}</Badge>
                <Badge data-testid="completed-count" variant="secondary" className="rounded-xl px-3 py-2">{t.completed}: {completedCount}</Badge>
                <Button data-testid="logout-button" variant="outline" className="rounded-2xl" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" /> {t.logout}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className={`rounded-3xl border-0 shadow-lg ${cardClass}`}>
            <CardContent className="flex h-full items-center justify-between gap-3 p-6">
              <div>
                <p className={`text-sm ${mutedClass}`}>{t.testUtility}</p>
                <p className="font-medium">{t.resetUtility}</p>
              </div>
              <Button data-testid="reset-app-state" variant="outline" onClick={resetDemoData}>{t.reset}</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className={`rounded-3xl border-0 shadow-lg ${cardClass}`}>
            <CardHeader>
              <CardTitle className="text-2xl">{editingId !== null ? t.editTask : t.createTask}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitTask} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.title}</label>
                  <Input
                    data-testid="task-title-input"
                    value={title}
                    onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setTitle(e.target.value)}
                    placeholder={t.enterTaskTitle}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.description}</label>
                  <Textarea
                    data-testid="task-description-input"
                    value={description}
                    onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setDescription(e.target.value)}
                    placeholder={t.optionalDescription}
                    className="min-h-32 rounded-2xl"
                  />
                </div>
                {formError ? (
                  <div data-testid="task-form-error" className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {formError}
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <Button data-testid="task-submit-button" className="rounded-2xl">
                    <Plus className="mr-2 h-4 w-4" />
                    {editingId !== null ? t.saveChanges : t.addTask}
                  </Button>
                  <Button type="button" variant="outline" className="rounded-2xl" data-testid="task-cancel-button" onClick={resetForm}>
                    {t.cancel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className={`rounded-3xl border-0 shadow-lg ${cardClass}`}>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-2xl">{t.tasks}</CardTitle>
              <Tabs value={filter} onValueChange={(value: string) => setFilter(value as 'all' | 'active' | 'completed')}>
                <TabsList className="grid w-full grid-cols-3 rounded-2xl sm:w-70">
                  <TabsTrigger data-testid="filter-all" value="all">{t.all}</TabsTrigger>
                  <TabsTrigger data-testid="filter-active" value="active">{t.active}</TabsTrigger>
                  <TabsTrigger data-testid="filter-completed" value="completed">{t.completed}</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div data-testid="task-list" className="space-y-3">
                {filteredTasks.length === 0 ? (
                  <div data-testid="empty-state" className="rounded-2xl border border-dashed p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    {t.noTasksFound}
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      data-testid={`task-item-${task.id}`}
                      className={`rounded-3xl border p-4 shadow-sm ${taskCardClass}`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex gap-3">
                          <Checkbox
                            data-testid={`task-toggle-${task.id}`}
                            checked={task.status === 'completed'}
                            onCheckedChange={() => toggleComplete(task.id)}
                            className="mt-1"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p
                                data-testid={`task-title-${task.id}`}
                                className={`font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : isDark ? 'text-slate-100' : 'text-slate-900'}`}
                              >
                                {task.title}
                              </p>
                              <Badge
                                data-testid={`task-status-${task.id}`}
                                variant={task.status === 'completed' ? 'secondary' : 'default'}
                                className="rounded-xl"
                              >
                                {task.status === 'completed' ? t.completed : t.active}
                              </Badge>
                            </div>
                            <p data-testid={`task-description-${task.id}`} className={`text-sm ${mutedClass}`}>
                              {task.description || t.noDescription}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            data-testid={`task-edit-${task.id}`}
                            variant="outline"
                            size="sm"
                            className="rounded-2xl"
                            onClick={() => startEdit(task)}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> {t.edit}
                          </Button>
                          <Button
                            data-testid={`task-delete-${task.id}`}
                            variant="outline"
                            size="sm"
                            className="rounded-2xl"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> {t.delete}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className={`rounded-3xl border-0 shadow-lg ${cardClass}`}>
          <CardContent className="flex flex-col gap-3 p-6 text-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium">{t.suggestedCoverage}</p>
              <p className={mutedClass}>{t.suggestedCoverageDesc}</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> {t.stableSelectors} <code>data-testid</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
