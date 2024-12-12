import type { LayoutServerLoad } from './$types'; // Adjust the path based on your project structure

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    user_info: locals?.user // This can be undefined if the user is not authenticated
  };
};
