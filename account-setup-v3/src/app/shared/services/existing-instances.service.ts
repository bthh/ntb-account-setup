import { Injectable } from '@angular/core';
import { FormData } from '../models/types';
import { ExistingInstance } from '../components/existing-instance-modal/existing-instance-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ExistingInstancesService {

  constructor() { }

  /**
   * Collect all existing instances across all registrations
   */
  collectExistingInstances(formData: FormData): ExistingInstance[] {
    const instances: ExistingInstance[] = [];

    // Define the registration mapping
    const registrationMapping: { [key: string]: string } = {
      'john-smith': 'Joint Registration',
      'mary-smith': 'Joint Registration', 
      'smith-trust': 'Trust Registration',
      'joint-account': 'Joint Registration',
      'roth-ira-account': 'Roth Registration',
      'trust-account': 'Trust Registration',
      'traditional-ira-account': 'Traditional IRA Registration'
    };

    // Collect funding instances
    Object.entries(formData).forEach(([entityId, entityData]) => {
      if (entityData && entityData.fundingInstances) {
        Object.entries(entityData.fundingInstances).forEach(([fundingType, fundingList]) => {
          if (Array.isArray(fundingList)) {
            fundingList.forEach((funding: any, index: number) => {
              instances.push({
                id: `${entityId}-${fundingType}-${index}`,
                type: 'funding',
                title: `${fundingType.toUpperCase()} Transfer`,
                subtitle: funding.institutionName || funding.bankName || 'Unknown Institution',
                sourceRegistration: registrationMapping[entityId] || 'Unknown',
                data: funding,
                displayFields: this.getFundingDisplayFields(funding, fundingType)
              });
            });
          }
        });
      }

      // Collect trustee instances from account setup
      if (entityData && entityData['trustees'] && Array.isArray(entityData['trustees'])) {
        entityData['trustees'].forEach((trustee: any, index: number) => {
          instances.push({
            id: `${entityId}-trustee-${index}`,
            type: 'trustee',
            title: `${trustee.firstName} ${trustee.lastName}`,
            subtitle: trustee.title || 'Trustee',
            sourceRegistration: registrationMapping[entityId] || 'Unknown',
            data: trustee,
            displayFields: {
              name: `${trustee.firstName} ${trustee.lastName}`,
              title: trustee.title || 'N/A',
              email: trustee.email || 'N/A',
              phone: trustee.phone || 'N/A'
            }
          });
        });
      }

      // Collect beneficiary instances from account setup
      if (entityData && entityData['beneficiaries'] && Array.isArray(entityData['beneficiaries'])) {
        entityData['beneficiaries'].forEach((beneficiary: any, index: number) => {
          // Handle both single name field and firstName/lastName fields
          const beneficiaryName = beneficiary.name || `${beneficiary.firstName || ''} ${beneficiary.lastName || ''}`.trim() || 'Unknown';
          
          instances.push({
            id: `${entityId}-beneficiary-${index}`,
            type: 'beneficiary',
            title: beneficiaryName,
            subtitle: `${beneficiary.percentage || 0}% - ${beneficiary.relationship || 'N/A'}`,
            sourceRegistration: registrationMapping[entityId] || 'Unknown',
            data: beneficiary,
            displayFields: {
              name: beneficiaryName,
              relationship: beneficiary.relationship || 'N/A',
              percentage: `${beneficiary.percentage || 0}%`,
              dateOfBirth: beneficiary.dateOfBirth || 'N/A'
            }
          });
        });
      }

      // Collect address instances
      const addresses = this.extractAddresses(entityData);
      addresses.forEach((address, index) => {
        instances.push({
          id: `${entityId}-address-${index}`,
          type: 'address',
          title: address.label,
          subtitle: address.address,
          sourceRegistration: registrationMapping[entityId] || 'Unknown',
          data: address,
          displayFields: {
            address: address.address,
            city: address.city || 'N/A',
            state: address.state || 'N/A',
            zipCode: address.zipCode || 'N/A'
          }
        });
      });
    });

    return instances;
  }

  private getFundingDisplayFields(funding: any, fundingType: string): { [key: string]: any } {
    const baseFields = {
      amount: funding.amount || 'N/A',
      accountNumber: funding.accountNumber || 'N/A'
    };

    switch (fundingType) {
      case 'acat':
        return {
          ...baseFields,
          institutionName: funding.institutionName || 'N/A',
          accountType: funding.accountType || 'N/A'
        };
      case 'ach':
      case 'initial-ach':
        return {
          ...baseFields,
          bankName: funding.bankName || 'N/A',
          routingNumber: funding.routingNumber || 'N/A'
        };
      case 'withdrawal':
        return {
          ...baseFields,
          withdrawalMethod: funding.withdrawalMethod || 'N/A',
          frequency: funding.frequency || 'N/A'
        };
      case 'contribution':
        return {
          ...baseFields,
          contributionMethod: funding.contributionMethod || 'N/A',
          frequency: funding.frequency || 'N/A'
        };
      default:
        return baseFields;
    }
  }

  private extractAddresses(entityData: any): Array<{label: string, address: string, city?: string, state?: string, zipCode?: string}> {
    const addresses = [];

    if (entityData.homeAddress) {
      addresses.push({
        label: 'Home Address',
        address: entityData.homeAddress,
        city: entityData.homeCity,
        state: entityData.homeState,
        zipCode: entityData.homeZipCode
      });
    }

    if (entityData.mailingAddress && entityData.mailingAddress !== entityData.homeAddress) {
      addresses.push({
        label: 'Mailing Address',
        address: entityData.mailingAddress,
        city: entityData.mailingCity,
        state: entityData.mailingState,
        zipCode: entityData.mailingZipCode
      });
    }

    if (entityData.workAddress) {
      addresses.push({
        label: 'Work Address',
        address: entityData.workAddress,
        city: entityData.workCity,
        state: entityData.workState,
        zipCode: entityData.workZipCode
      });
    }

    return addresses;
  }

  /**
   * Apply selected instance data to current form fields
   */
  applyInstanceData(instanceType: 'funding' | 'trustee' | 'beneficiary' | 'address', instanceData: any, targetFields: any): any {
    switch (instanceType) {
      case 'funding':
        return this.applyFundingInstance(instanceData, targetFields);
      case 'trustee':
        return this.applyTrusteeInstance(instanceData, targetFields);
      case 'beneficiary':
        return this.applyBeneficiaryInstance(instanceData, targetFields);
      case 'address':
        return this.applyAddressInstance(instanceData, targetFields);
      default:
        return targetFields;
    }
  }

  private applyFundingInstance(instanceData: any, targetFields: any): any {
    return {
      ...targetFields,
      institutionName: instanceData.institutionName || instanceData.bankName,
      bankName: instanceData.bankName,
      accountNumber: instanceData.accountNumber,
      routingNumber: instanceData.routingNumber,
      accountType: instanceData.accountType,
      amount: instanceData.amount,
      withdrawalMethod: instanceData.withdrawalMethod,
      contributionMethod: instanceData.contributionMethod,
      frequency: instanceData.frequency
    };
  }

  private applyTrusteeInstance(instanceData: any, targetFields: any): any {
    return {
      ...targetFields,
      firstName: instanceData.firstName,
      lastName: instanceData.lastName,
      title: instanceData.title,
      email: instanceData.email,
      phone: instanceData.phone,
      dateOfBirth: instanceData.dateOfBirth,
      ssn: instanceData.ssn
    };
  }

  private applyBeneficiaryInstance(instanceData: any, targetFields: any): any {
    return {
      ...targetFields,
      firstName: instanceData.firstName,
      lastName: instanceData.lastName,
      relationship: instanceData.relationship,
      percentage: instanceData.percentage,
      dateOfBirth: instanceData.dateOfBirth,
      ssn: instanceData.ssn
    };
  }

  private applyAddressInstance(instanceData: any, targetFields: any): any {
    // Build complete address string if we have components
    let fullAddress = instanceData.address || '';
    if (instanceData.city || instanceData.state || instanceData.zipCode) {
      const components = [instanceData.city, instanceData.state, instanceData.zipCode].filter(Boolean);
      if (components.length > 0 && fullAddress) {
        fullAddress += ', ' + components.join(', ');
      } else if (components.length > 0) {
        fullAddress = components.join(', ');
      }
    }
    
    return {
      ...targetFields,
      address: fullAddress,
      homeAddress: fullAddress, // Also populate homeAddress field
      mailingAddress: fullAddress, // Also populate mailingAddress field
      city: instanceData.city,
      state: instanceData.state,
      zipCode: instanceData.zipCode
    };
  }
}