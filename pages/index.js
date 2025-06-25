import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layouts';
import InputForm from '../components/InputForm';
import { Sparkles, BarChart3, Users, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackAnalysisStart } from '../lib/gtag';

export default function Home() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    
    try {
      // Track analytics
      trackAnalysisStart({
        jobTitle: formData.jobTitle,
        inputType: formData.jobDescription ? 'jobDescription' : 'roleTitle',
        experienceLevel: formData.experienceLevel
      });

      // Submit to API
      const response = await fetch('/api/analysis/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start analysis');
      }

      // Show success message
      toast.success('Analysis started successfully!');

      // Redirect to dashboard with requirement ID
      router.push(`/dashboard?id=${data.requirementId}`);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to start analysis. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Resume Scoring AI - Intelligent Candidate Evaluation</title>
        <meta name="description" content="AI-powered resume screening and candidate evaluation platform for modern HR teams." />
      </Head>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-700/25 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse bg-blue-400 blur-xl opacity-30"></div>
                  <Sparkles className="relative h-16 w-16 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Find Your Perfect
                <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Candidate Match
                </span>
              </h1>
              
              <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 mb-10">
                Leverage AI to streamline your hiring process. Analyze resumes, match candidates to job requirements, and make data-driven hiring decisions in minutes.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">95%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Time Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">10k+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Resumes Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">4.8/5</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">User Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">AI Processing</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Input Form Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Start Your Analysis
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Enter a job title or paste a complete job description to begin
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl p-8">
              <InputForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Powerful Features for Modern Hiring
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Everything you need to make better hiring decisions, faster
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Lightning Fast Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Process hundreds of resumes in minutes with our advanced AI algorithms. Get instant results and insights.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Smart Candidate Matching
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our AI understands context and matches candidates based on skills, experience, and cultural fit.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Comprehensive Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get detailed insights with visual reports, skill gap analysis, and candidate comparison tools.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Bias-Free Evaluation
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our AI focuses on skills and qualifications, ensuring fair and objective candidate assessment.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Interview Insights
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get personalized interview questions and talking points based on each candidate's profile.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                  <ArrowRight className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Seamless Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Export results, schedule interviews, and integrate with your existing HR workflow effortlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Hiring Process?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of companies using AI to find their perfect candidates
            </p>
            <button
              onClick={() => document.getElementById('job-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
}