import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function ChooseLogin() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-background p-4">
      <Card className="p-8 text-center w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6">Choose Portal</h2>

        <div className="space-y-4">
          <Link to="/login/student"><Button className="w-full">Student Login</Button></Link>
          <Link to="/login/driver"><Button className="w-full">Driver Login</Button></Link>
          <Link to="/login/admin"><Button className="w-full">Admin Login</Button></Link>
        </div>
      </Card>
    </div>
  );
}
