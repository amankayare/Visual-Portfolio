import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/components/ui/theme-provider';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { Input } from '@/components/ui/input';
=======
>>>>>>> origin/main
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
<<<<<<< HEAD
import { LogOut, Users, MessageSquare, FolderOpen, FileText, Award, BarChart3, User, Briefcase, Code, ShieldCheck, Sun, Moon, Search, X } from 'lucide-react';
=======
import { LogOut, Users, MessageSquare, FolderOpen, FileText, Award, BarChart3, User, Briefcase, Code, ShieldCheck, Sun, Moon } from 'lucide-react';
>>>>>>> origin/main

interface DashboardStats {
  projects_count: number;
  blogs_count: number;
  certifications_count: number;
  contact_messages_count: number;
  users_count: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
<<<<<<< HEAD
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
=======
>>>>>>> origin/main

  useEffect(() => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      setLocation('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (!userData.is_admin) {
      toast({
        title: 'Access Denied',
        description: 'You need admin access to view this page.',
        variant: 'destructive',
      });
      setLocation('/');
      return;
    }

    setCurrentUser(userData);
  }, [setLocation, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    queryFn: async (): Promise<DashboardStats> => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
    enabled: !!currentUser,
  });

<<<<<<< HEAD
  const { data: users = [], isLoading: usersLoading } = useQuery({
=======
  const { data: users, isLoading: usersLoading } = useQuery({
>>>>>>> origin/main
    queryKey: ['/api/admin/users'],
    queryFn: async (): Promise<User[]> => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: !!currentUser,
  });

<<<<<<< HEAD
  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!userSearchQuery.trim()) return true;
    const query = userSearchQuery.toLowerCase();
    const joinDate = new Date(user.created_at).toLocaleDateString().toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      joinDate.includes(query)
    );
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
=======
  const { data: messages, isLoading: messagesLoading } = useQuery({
>>>>>>> origin/main
    queryKey: ['/api/contact/admin/messages'],
    queryFn: async (): Promise<ContactMessage[]> => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/contact/admin/messages', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch contact messages');
      return response.json();
    },
    enabled: !!currentUser,
  });

<<<<<<< HEAD
  // Filter messages based on search query
  const filteredMessages = messages.filter(message => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      message.subject?.toLowerCase().includes(query) ||
      message.name?.toLowerCase().includes(query) ||
      message.email?.toLowerCase().includes(query)
    );
  });

=======
>>>>>>> origin/main
  const toggleAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to toggle admin status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'Success',
        description: 'User admin status updated successfully.',
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/contact/admin/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact/admin/messages'] });
      toast({
        title: 'Success',
        description: 'Message deleted successfully.',
      });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLocation('/');
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-gray-950/90 shadow-md border-b border-gray-200 dark:border-gray-800 backdrop-blur">
        <div className="p-4 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <ShieldCheck className="w-6 h-6 text-indigo-700 dark:text-indigo-300" />
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <Badge variant="secondary">Welcome, {currentUser.username}</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="h-9 w-9"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center pt-2 pb-6 w-full px-2 sm:px-6">
        <div className="w-full max-w-7xl">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Welcome Section */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-muted-foreground">Monitor your portfolio performance and manage content</p>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 dark:bg-gray-900 rounded-t">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">Projects</CardTitle>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full ring-1 ring-gray-200 dark:ring-gray-700">
                      <FolderOpen className="h-4 w-4 text-blue-500 dark:text-blue-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {statsLoading ? '...' : stats?.projects_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Active projects</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 dark:bg-gray-900 rounded-t">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">Blog Posts</CardTitle>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full ring-1 ring-gray-200 dark:ring-gray-700">
                      <FileText className="h-4 w-4 text-green-500 dark:text-green-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {statsLoading ? '...' : stats?.blogs_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Published articles</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 dark:bg-gray-900 rounded-t">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">Certifications</CardTitle>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full ring-1 ring-gray-200 dark:ring-gray-700">
                      <Award className="h-4 w-4 text-purple-500 dark:text-purple-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {statsLoading ? '...' : stats?.certifications_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Earned certificates</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 dark:bg-gray-900 rounded-t">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">Messages</CardTitle>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full ring-1 ring-gray-200 dark:ring-gray-700">
                      <MessageSquare className="h-4 w-4 text-orange-500 dark:text-orange-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {statsLoading ? '...' : stats?.contact_messages_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Contact inquiries</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 dark:bg-gray-900 rounded-t">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">Users</CardTitle>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full ring-1 ring-gray-200 dark:ring-gray-700">
                      <Users className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-indigo-600">
                      {statsLoading ? '...' : stats?.users_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Registered users</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
                <p className="text-muted-foreground dark:text-gray-300">Manage user accounts and permissions</p>
              </div>

              <Card className="shadow-lg dark:shadow-none">
<<<<<<< HEAD
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-10 w-full"
                      value={userSearchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserSearchQuery(e.target.value)}
                    />
                    {userSearchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setUserSearchQuery('')}
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
=======
                <CardHeader className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 rounded-t">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Users className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
                    Registered Users ({users?.length || 0})
                  </CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-gray-300">
                    View and manage user roles and permissions
                  </CardDescription>
>>>>>>> origin/main
                </CardHeader>
                <CardContent className="p-6">
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-300"></div>
                      <span className="ml-2 text-muted-foreground dark:text-gray-300">Loading users...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
<<<<<<< HEAD
                      {filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Search className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {userSearchQuery ? 'No matching users found' : 'No users found'}
                          </h3>
                          <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                            {userSearchQuery ? 'Try adjusting your search or filter to find what you\'re looking for.' : 'There are no users to display.'}
                          </p>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground dark:text-gray-400 mb-2">
                          Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                          {userSearchQuery && ` matching "${userSearchQuery}"`}
                        </div>
                      )}
                      {filteredUsers.map((user) => (
=======
                      {users?.map((user) => (
>>>>>>> origin/main
                        <div
                          key={user.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 space-y-3 sm:space-y-0"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{user.username}</h3>
                              <p className="text-sm text-muted-foreground dark:text-gray-300 truncate">{user.email}</p>
                              <p className="text-xs text-muted-foreground dark:text-gray-400">
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end space-x-3">
                            <Badge
                              variant={user.is_admin ? "default" : "secondary"}
                              className={user.is_admin
                                ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                                : "dark:bg-gray-700 dark:text-gray-200"}
                            >
                              {user.is_admin ? "Admin" : "User"}
                            </Badge>
                            <Button
                              variant={user.is_admin ? "destructive" : "default"}
                              size="sm"
                              onClick={() => toggleAdminMutation.mutate(user.id)}
                              disabled={toggleAdminMutation.isPending}
                              className={
                                user.is_admin
                                  ? "text-white text-xs sm:text-sm px-2 sm:px-4 flex-shrink-0 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                  : "text-xs sm:text-sm px-2 sm:px-4 flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white"
                              }
                            >
                              <span className="hidden sm:inline">{user.is_admin ? "Remove Admin" : "Make Admin"}</span>
                              <span className="sm:hidden">{user.is_admin ? "Remove" : "Make"}</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Contact Messages</h2>
                <p className="text-muted-foreground">View and manage contact form submissions</p>
              </div>

              <Card className="shadow-lg dark:shadow-none">
                <CardHeader className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 rounded-t">
<<<<<<< HEAD
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <MessageSquare className="h-5 w-5 text-orange-500 dark:text-orange-300" />
                        Messages ({filteredMessages.length})
                      </CardTitle>
                      <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search by subject, name, or email..."
                          className="pl-10 pr-10 w-full"
                          value={searchQuery}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
                            onClick={() => setSearchQuery('')}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Clear search</span>
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-muted-foreground dark:text-gray-300">
                      {searchQuery ? (
                        <span>Showing {filteredMessages.length} messages matching "{searchQuery}"</span>
                      ) : (
                        'Review and respond to contact inquiries'
                      )}
                    </CardDescription>
                  </div>
=======
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <MessageSquare className="h-5 w-5 text-orange-500 dark:text-orange-300" />
                    Messages ({messages?.length || 0})
                  </CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-gray-300">
                    Review and respond to contact inquiries
                  </CardDescription>
>>>>>>> origin/main
                </CardHeader>
                <CardContent className="p-6">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 dark:border-orange-300"></div>
                      <span className="ml-2 text-muted-foreground dark:text-gray-300">Loading messages...</span>
                    </div>
<<<<<<< HEAD
                  ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-muted-foreground dark:text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground dark:text-gray-300">
                        {searchQuery
                          ? `No messages found matching "${searchQuery}"`
                          : 'No messages available'}
                      </p>
                    </div>
=======
>>>>>>> origin/main
                  ) : messages?.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground dark:text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground dark:text-gray-300">No messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
<<<<<<< HEAD
                      {filteredMessages.map((message) => (
=======
                      {messages?.map((message) => (
>>>>>>> origin/main
                        <div
                          key={message.id}
                          className="p-4 sm:p-6 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-700 dark:to-red-800 rounded-full flex items-center justify-center flex-shrink-0">
                                  <MessageSquare className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 break-words">{message.subject}</h3>
                              </div>
                              <div className="mb-3 space-y-1">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 break-words">
                                  From: {message.name}
                                </p>
                                <p className="text-sm text-muted-foreground dark:text-gray-300 break-all">
                                  Email: {message.email}
                                </p>
                                <p className="text-xs text-muted-foreground dark:text-gray-400">
                                  Received: {new Date(message.created_at).toLocaleDateString()} at {new Date(message.created_at).toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-orange-500">
                                <p className="text-sm text-gray-700 dark:text-gray-100 leading-relaxed break-words">{message.message}</p>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteMessageMutation.mutate(message.id)}
                              disabled={deleteMessageMutation.isPending}
                              className="sm:ml-4 text-white w-full sm:w-auto"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Content Management</h2>
                <p className="text-muted-foreground">Manage all aspects of your portfolio content</p>
              </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {/* Projects Card */}
                <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
                  <CardHeader className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 rounded-t">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <FolderOpen className="h-5 w-5 text-blue-500 dark:text-blue-300" />
                      Projects
                    </CardTitle>
                    <CardDescription className="text-muted-foreground dark:text-gray-300">Manage your portfolio projects</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Button
                      variant="default"
                      className="w-full px-6 py-3.5 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-800 dark:hover:bg-blue-700 text-white shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 transition-all duration-200 transform hover:-translate-y-0.5"
                      onClick={() => setLocation('/admin/projects')}
                    >
                      Manage Projects
                    </Button>
                  </CardContent>
                </Card>

                {/* Blog Posts Card */}
                <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900">
                  <CardHeader className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 rounded-t">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <FileText className="h-5 w-5 text-green-500 dark:text-green-300" />
                      Blog Posts
                    </CardTitle>
                    <CardDescription className="text-muted-foreground dark:text-gray-300">Create and edit blog articles</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Button
                      variant="default"
                      className="w-full px-6 py-3.5 rounded-lg bg-green-500 hover:bg-green-600 dark:bg-green-800 dark:hover:bg-green-700 text-white shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-green-400 transition-all duration-200 transform hover:-translate-y-0.5"
                      onClick={() => setLocation('/admin/blogs')}
                    >
                      Manage Blog Posts
                    </Button>
                  </CardContent>
                </Card>

                {/* Certifications Card */}
                <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900 dark:to-violet-900">
                  <CardHeader className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 rounded-t">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Award className="h-5 w-5 text-purple-500 dark:text-purple-300" />
                      Certifications
                    </CardTitle>
                    <CardDescription className="text-muted-foreground dark:text-gray-300">Add and update certifications</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Button
                      variant="default"
                      className="w-full px-6 py-3.5 rounded-lg bg-purple-500 hover:bg-purple-600 dark:bg-purple-800 dark:hover:bg-purple-700 text-white shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-purple-400 transition-all duration-200 transform hover:-translate-y-0.5"
                      onClick={() => setLocation('/admin/certifications')}
                    >
                      Manage Certifications
                    </Button>
                  </CardContent>
                </Card>

                {/* About Section Card */}
                <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900 dark:to-red-900">
                  <CardHeader className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 rounded-t">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <User className="h-5 w-5 text-orange-500 dark:text-orange-300" />
                      About Section
                    </CardTitle>
                    <CardDescription className="text-muted-foreground dark:text-gray-300">Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Button
                      variant="default"
                      className="w-full px-6 py-3.5 rounded-lg bg-orange-500 hover:bg-orange-600 dark:bg-orange-800 dark:hover:bg-orange-700 text-white shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-orange-400 transition-all duration-200 transform hover:-translate-y-0.5"
                      onClick={() => setLocation('/admin/about')}
                    >
                      Manage About
                    </Button>
                  </CardContent>
                </Card>

                {/* Experience Card */}
                <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900 dark:to-cyan-900">
                  <CardHeader className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 rounded-t">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Briefcase className="h-5 w-5 text-teal-500 dark:text-teal-300" />
                      Experience
                    </CardTitle>
                    <CardDescription className="text-muted-foreground dark:text-gray-300">Manage work experience entries</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Button
                      variant="default"
                      className="w-full px-6 py-3.5 rounded-lg bg-teal-500 hover:bg-teal-600 dark:bg-teal-800 dark:hover:bg-teal-700 text-white shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-teal-400 transition-all duration-200 transform hover:-translate-y-0.5"
                      onClick={() => setLocation('/admin/experience')}
                    >
                      Manage Experience
                    </Button>
                  </CardContent>
                </Card>

                {/* Technical Skills Card */}
                <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900 dark:to-rose-900">
                  <CardHeader className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 rounded-t">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Code className="h-5 w-5 text-pink-500 dark:text-pink-300" />
                      Technical Skills
                    </CardTitle>
                    <CardDescription className="text-muted-foreground dark:text-gray-300">Update your technical skills</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Button
                      variant="default"
                      className="w-full px-6 py-3.5 rounded-lg bg-pink-500 hover:bg-pink-600 dark:bg-pink-800 dark:hover:bg-pink-700 text-white shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-pink-400 transition-all duration-200 transform hover:-translate-y-0.5"
                      onClick={() => setLocation('/admin/technical-skills')}
                    >
                      Manage Skills
                    </Button>
                  </CardContent>
                </Card>
              </div>

            </TabsContent>
          </Tabs>
        </div>

      </main>
    </div>
  );
}