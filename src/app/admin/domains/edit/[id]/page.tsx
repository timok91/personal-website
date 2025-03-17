'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Domain, Test, Question, Facet } from '@/types/database';
import Breadcrumb from '@/components/admin/Breadcrumb';

// Define a specific interface for params
interface ViewDomainParams {
  params: { id: string } | Promise<{ id: string }>;
}

// eslint-disable-next-line @next/next/no-async-client-component
export default async function ViewDomainPage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: ViewDomainParams | any
): Promise<React.ReactElement> {
  try {
    // Type assertion to help TypeScript understand the structure
    const { params } = props as { params: { id: string } | Promise<{ id: string }> };
    
    // Await params in case they're a promise 
    const resolvedParams = await Promise.resolve(params);
    const domainId = resolvedParams.id;
    
    // Inner component with actual implementation
    const ViewDomainContent = () => {
      const [domain, setDomain] = useState<Domain | null>(null);
      const [test, setTest] = useState<Test | null>(null);
      const [facets, setFacets] = useState<Facet[]>([]);
      const [questions, setQuestions] = useState<Question[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
    
      useEffect(() => {
        const fetchDomainData = async () => {
          try {
            setLoading(true);
            const supabase = createClient();
            
            // Fetch the domain
            const { data: domainData, error: domainError } = await supabase
              .from('domains')
              .select('*')
              .eq('id', domainId)
              .single();
            
            if (domainError) throw new Error(domainError.message);
            if (!domainData) throw new Error('Domain not found');
            
            setDomain(domainData);
            
            // Fetch the parent test
            const { data: testData, error: testError } = await supabase
              .from('tests')
              .select('*')
              .eq('id', domainData.test_id)
              .single();
            
            if (testError) throw new Error(testError.message);
            setTest(testData || null);
            
            // Fetch facets (if any)
            const { data: facetData, error: facetError } = await supabase
              .from('facets')
              .select('*')
              .eq('domain_id', domainId)
              .order('display_order', { ascending: true });
            
            if (facetError) throw new Error(facetError.message);
            setFacets(facetData || []);
            
            // Fetch associated questions
            const { data: questionData, error: questionError } = await supabase
              .from('questions')
              .select('*')
              .eq('domain_id', domainId)
              .order('display_order', { ascending: true });
            
            if (questionError) throw new Error(questionError.message);
            setQuestions(questionData || []);
            
          } catch (err) {
            console.error('Error fetching domain data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load domain data');
          } finally {
            setLoading(false);
          }
        };
    
        fetchDomainData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [domainId]);
    
      if (loading) {
        return <div className="loading-state">Loading domain details...</div>;
      }
    
      if (!domain || !test) {
        return (
          <div className="error-state">
            <h1>Domain not found</h1>
            <p>The requested domain could not be found.</p>
            <Link href="/admin/domains" className="action-button">
              Back to Domains
            </Link>
          </div>
        );
      }
    
      return (
        <div>
          <Breadcrumb currentPageName="View Domains" />
    
          <div className="page-header">
            <h1>Domain Details</h1>
            <div className="header-actions">
              <Link href={`/admin/domains/edit/${domainId}`} className="action-button">
                Edit Domain
              </Link>
            </div>
          </div>
    
          {error && <div className="error-message">{error}</div>}
    
          <div className="domain-details-container">
            <div className="domain-info admin-table-container">
              <h2>{domain.name_en} / {domain.name_de}</h2>
              
              <div className="domain-meta">
                <p><strong>Test:</strong> {test.name_en}</p>
                <p><strong>Display Order:</strong> {domain.display_order}</p>
                <p><strong>Created:</strong> {new Date(domain.created_at).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> {new Date(domain.updated_at).toLocaleDateString()}</p>
              </div>
              
              <div className="domain-descriptions">
                <div className="description-section">
                  <h3>English Description</h3>
                  <p>{domain.description_en || 'No description available'}</p>
                </div>
                <div className="description-section">
                  <h3>German Description</h3>
                  <p>{domain.description_de || 'No description available'}</p>
                </div>
              </div>
            </div>
            
            {/* Facets Section */}
            <div className="facets-section admin-table-container">
              <div className="section-header">
                <h2>Facets ({facets.length})</h2>
                <Link href={`/admin/facets/new?domainId=${domainId}`} className="action-button small">
                  Add Facet
                </Link>
              </div>
              
              {facets.length === 0 ? (
                <div className="empty-state">
                  <p>No facets found for this domain.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Name (EN)</th>
                      <th>Name (DE)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facets.map((facet) => (
                      <tr key={facet.id}>
                        <td>{facet.display_order}</td>
                        <td>{facet.name_en}</td>
                        <td>{facet.name_de}</td>
                        <td>
                          <div className="table-actions">
                            <Link 
                              href={`/admin/facets/edit/${facet.id}`}
                              className="action-icon edit"
                              title="Edit facet"
                            >
                              ✏️
                            </Link>
                            <Link 
                              href={`/admin/facets/delete/${facet.id}`}
                              className="action-icon delete"
                              title="Delete facet"
                            >
                              🗑️
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Questions Section */}
            <div className="questions-section admin-table-container">
              <div className="section-header">
                <h2>Questions ({questions.length})</h2>
                <Link href={`/admin/questions/new?domainId=${domainId}&testId=${test.id}`} className="action-button small">
                  Add Question
                </Link>
              </div>
              
              {questions.length === 0 ? (
                <div className="empty-state">
                  <p>No questions found for this domain.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Question (EN)</th>
                      <th>Question (DE)</th>
                      <th>Facet</th>
                      <th>Reverse Keyed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((question) => {
                      // Find the facet for this question (if any)
                      const facet = question.facet_id ? facets.find(f => f.id === question.facet_id) : null;
                      
                      return (
                        <tr key={question.id}>
                          <td>{question.display_order}</td>
                          <td>{question.text_en}</td>
                          <td>{question.text_de}</td>
                          <td>{facet ? facet.name_en : 'N/A'}</td>
                          <td>{question.is_reverse_keyed ? 'Yes' : 'No'}</td>
                          <td>
                            <div className="table-actions">
                              <Link 
                                href={`/admin/questions/edit/${question.id}`}
                                className="action-icon edit"
                                title="Edit question"
                              >
                                ✏️
                              </Link>
                              <Link 
                                href={`/admin/questions/delete/${question.id}`}
                                className="action-icon delete"
                                title="Delete question"
                              >
                                🗑️
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      );
    };
    
    return <ViewDomainContent />;
  } catch (error) {
    console.error('Error in View Domain Page:', error);
    return (
      <div className="error-state">
        <h1>Error Loading Domain</h1>
        <p>There was an error loading the domain data.</p>
        <Link href="/admin/domains" className="action-button">
          Back to Domains
        </Link>
      </div>
    );
  }
}